# Python Log Collection Agent: Integration with `/api/ingest`

This document outlines the conceptual modifications and considerations for a Python-based log collection agent designed to send log data to the `/api/ingest` endpoint of the EventLog Analyzer application.

## 1. Agent Overview (Conceptual)

The agent is envisioned as a Python script (`log_collector.py` or similar) that runs on monitored endpoints or log aggregation servers. Its primary responsibilities are:

*   Collecting logs from various sources (e.g., Windows Event Logs, text-based log files like Syslog or application logs).
*   Formatting collected log entries into a structure suitable for the ingestion API.
*   Batching these formatted events.
*   Periodically sending these batches to the `/api/ingest` endpoint.
*   Handling responses and errors from the API.

## 2. Core Modifications Required

### 2.1. Dependencies

The agent will require several Python libraries:

*   **`requests`**: For making HTTP POST requests to the `/api/ingest` endpoint.
    ```bash
    pip install requests
    ```
*   **For Windows Event Log Collection (if not using direct PowerShell output to a file that is then read):**
    *   `pywin32` (if directly interacting with Windows Event Log API - more complex).
    *   Alternatively, using `subprocess` to call PowerShell is simpler for this PoC.
*   **For Log File Monitoring:**
    *   No special external library is strictly needed for basic file tailing, but libraries like `watchdog` can provide more robust file system event monitoring if needed.
*   **`psutil` (Optional):** For gathering additional system information if desired to enrich logs (e.g., CPU, memory usage at the time of an event).
    ```bash
    pip install psutil
    ```

### 2.2. Configuration

The agent should be configurable, potentially via a configuration file (e.g., `config.ini`, `config.yaml`) or environment variables.

```python
# config.py or loaded from a file
INGEST_API_URL = "http://localhost:3000/api/ingest" # Or your deployed API URL
BATCH_SIZE = 10  # Number of events to collect before sending
FLUSH_INTERVAL_SECONDS = 5  # Max time to wait before sending an incomplete batch
LOG_SOURCE_IDENTIFIER = "windows_event_json" # Changes based on the source being monitored
# For Windows: "windows_event_json"
# For Syslog: "syslog_rfc5424" (or a custom identifier if format varies)
# For other app logs: a custom identifier like "myapplication_log"
AGENT_ID = "agent-hostname-xyz" # Optional: An identifier for the agent itself
```

### 2.3. Data Collection & Formatting

#### 2.3.1. Windows Event Logs

*   **Strategy:** The recommended approach for simplicity in a PoC is to use PowerShell's `Get-WinEvent` cmdlet combined with `ConvertTo-Json`. The Python agent can invoke this using the `subprocess` module.
*   **PowerShell Command Example:**
    ```powershell
    Get-WinEvent -LogName Security -MaxEvents 20 | ConvertTo-Json -Depth 5 -Compress
    ```
    *   `-MaxEvents` can be used to limit the number of events fetched per call, or use `-FilterHashtable` for more specific filtering (e.g., by Event ID, time).
    *   The agent would need to manage how often it queries and which events it has already processed (e.g., by bookmarking the last `RecordId` or `TimeCreated`).
*   **Parsing JSON Output:** The Python agent will capture the standard output of the PowerShell command, which will be a JSON string (potentially an array of event objects). This can be parsed using `json.loads()`. Each object in the parsed JSON array is a "raw event" to be sent to the API.

#### 2.3.2. Log File Monitoring (e.g., Syslog, Application Logs)

*   **Tailing Files:**
    *   Open the log file in read mode.
    *   Seek to the end of the file.
    *   Periodically check for new lines (e.g., using `file.readline()` in a loop with `time.sleep()`).
    *   Keep track of the last read position (inode and offset) to handle log rotations.
*   **Structuring Log Lines:**
    *   For syslog or simple text logs, each new line is typically a raw event.
    *   The agent needs to wrap this line into a structure expected by the `normalizeEvent` function for that `log_source_identifier`. For generic line-based logs, this might be:
        ```python
        raw_event_data = "Actual syslog line or application log line"
        # For "syslog_rfc5424", send the raw line.
        # For a generic text log, you might send:
        # raw_event_data = { "message": "Actual log line", "timestamp_collected": datetime.utcnow().isoformat() }
        # The specific structure depends on what the corresponding normalizer (e.g., normalizeSyslog) expects.
        ```
    *   If `log_source_identifier` is "syslog_rfc5424", the raw event sent in the `events` array should be the raw syslog string itself. The `normalizeSyslog` function in the backend will attempt to parse it.

### 2.4. Event Batching

*   Maintain a list in memory (e.g., `event_batch = []`).
*   As events are collected, append them to this list.
*   After adding an event, check if `len(event_batch) >= BATCH_SIZE`.
*   Separately, have a timer that triggers every `FLUSH_INTERVAL_SECONDS`.
*   If either condition (batch size reached or flush interval timeout) is met and the batch is not empty, send the batch.

### 2.5. Sending Data to `/api/ingest`

*   **Payload Construction:**
    ```python
    payload = {
        "log_source_identifier": LOG_SOURCE_IDENTIFIER,
        "events": event_batch # List of collected raw event objects/strings
    }
    ```
*   **HTTP POST Request:** Use `requests.post()`:
    ```python
    headers = {"Content-Type": "application/json"}
    response = requests.post(INGEST_API_URL, json=payload, timeout=10) # timeout in seconds
    ```

### 2.6. Response Handling & Agent-Side Error Management

*   **Check HTTP Status Codes:**
    *   `200 OK` / `201 Created`: Batch accepted and all events processed successfully.
    *   `207 Multi-Status`: Batch accepted, some events processed, some failed. The response body (`response.json()`) will contain `successful`, `failed`, and `failures` details. Log this.
    *   `400 Bad Request`: Problem with the agent's payload (e.g., malformed JSON, missing fields). Log error, review agent formatting. Unlikely to succeed on retry without changes. Potentially discard or quarantine the batch.
    *   `401 Unauthorized` / `403 Forbidden`: Authentication/authorization issues if the API is secured.
    *   `5xx Server Error`: Problem on the API server side. Implement retry logic.
*   **Retry Logic:**
    *   For network errors (`requests.exceptions.ConnectionError`, `requests.exceptions.Timeout`) or 5xx server errors, implement a simple exponential backoff retry mechanism (e.g., wait 5s, then 10s, then 20s, up to a max number of retries).
*   **Logging:**
    *   Log successful batch sends (e.g., number of events sent).
    *   Log partial successes with details from the 207 response.
    *   Log errors comprehensively, including the type of error, API response if available, and potentially a sample of the batch that failed (be careful with sensitive data in logs).
    *   Log retry attempts.

### 2.7. Main Loop (Conceptual)

```python
import time
# ... other imports and functions ...

event_batch = []
last_flush_time = time.time()

try:
    while True:
        # 1. Collect Events (Windows or File Tailing)
        # raw_event = collect_one_windows_event()
        # OR
        # raw_event_line = tail_log_file_line()
        # if raw_event_line: raw_event = format_log_line(raw_event_line)

        # For PoC, let's assume a function get_new_events() returns a list of new events
        new_events = get_new_events(LOG_SOURCE_IDENTIFIER) # This function would encapsulate PowerShell call or file tailing

        if new_events:
            event_batch.extend(new_events)
            print(f"Collected {len(new_events)} new events. Batch size: {len(event_batch)}")

        current_time = time.time()
        if event_batch and (len(event_batch) >= BATCH_SIZE or (current_time - last_flush_time) >= FLUSH_INTERVAL_SECONDS):
            print(f"Attempting to send batch of {len(event_batch)} events.")
            if send_batch_to_api(INGEST_API_URL, LOG_SOURCE_IDENTIFIER, event_batch):
                event_batch = [] # Clear batch on successful send
            else:
                # Handle persistent failure (e.g., write to disk, log critical error)
                # For PoC, might just log and clear or retry a few times
                print("Failed to send batch after retries. Discarding for PoC or implement dead-letter queue.")
                # event_batch = [] # Decide on strategy
            last_flush_time = current_time

        time.sleep(1) # Check for new events every second (adjust as needed)
except KeyboardInterrupt:
    print("Agent shutting down...")
    # Attempt to send any remaining events in batch before exiting
    if event_batch:
        send_batch_to_api(INGEST_API_URL, LOG_SOURCE_IDENTIFIER, event_batch)
```

## 3. Example Python Snippets (Conceptual)

### Sending Data using `requests`

```python
import requests
import json
import time

def send_batch_to_api(api_url, log_source_id, event_list, max_retries=3, initial_retry_delay=5):
    if not event_list:
        return True # Nothing to send

    payload = {
        "log_source_identifier": log_source_id,
        "events": event_list
    }
    headers = {"Content-Type": "application/json"}

    retries = 0
    while retries < max_retries:
        try:
            response = requests.post(api_url, json=payload, timeout=15) # Increased timeout
            response.raise_for_status() # Raises HTTPError for 4XX/5XX status codes

            print(f"Successfully sent {len(event_list)} events. API Response: {response.json()}")
            return True
        except requests.exceptions.HTTPError as http_err:
            # Handle HTTP errors (4xx, 5xx)
            print(f"HTTP error sending batch: {http_err} - Response: {http_err.response.text}")
            if 400 <= http_err.response.status_code < 500:
                print("Client error. Batch may be malformed. Not retrying.")
                return False # Don't retry client errors like 400
            # For 5xx server errors, retry
            retries += 1
            delay = initial_retry_delay * (2 ** (retries - 1))
            print(f"Server error. Retrying in {delay} seconds... (Attempt {retries}/{max_retries})")
            time.sleep(delay)
        except requests.exceptions.RequestException as req_err:
            # Handle other request exceptions (connection, timeout, etc.)
            print(f"Request exception sending batch: {req_err}")
            retries += 1
            delay = initial_retry_delay * (2 ** (retries - 1))
            print(f"Retrying in {delay} seconds... (Attempt {retries}/{max_retries})")
            time.sleep(delay)

    print(f"Failed to send batch after {max_retries} retries.")
    return False
```

### Using `subprocess` for PowerShell (Windows Events)

```python
import subprocess
import json

def get_windows_events_powershell(log_name="Security", max_events=10):
    # Ensure PowerShell 7+ (pwsh) is preferred if available for ConvertTo-Json -Depth 5 reliability,
    # otherwise use 'powershell' for Windows PowerShell.
    ps_command = "pwsh" # Or "powershell"
    command = [
        ps_command, "-NoProfile", "-Command",
        f"Get-WinEvent -LogName '{log_name}' -MaxEvents {max_events} | ConvertTo-Json -Depth 5 -Compress"
    ]
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True, shell=False)
        raw_json_output = result.stdout
        if not raw_json_output.strip():
            return [] # No events found

        # ConvertTo-Json with multiple objects might return them concatenated, not as a single JSON array.
        # A common workaround is to wrap the output or process line by line if -Compress is not used.
        # If -Compress is used and there's only one object, it's fine. If multiple, it might be an array.
        # Test this output carefully.
        try:
            events = json.loads(raw_json_output)
            # If Get-WinEvent returns a single event, ConvertTo-Json might output a single object.
            # The API expects an array of events.
            return [events] if not isinstance(events, list) else events
        except json.JSONDecodeError as e:
            print(f"JSON Decode Error from PowerShell output: {e}")
            print(f"Raw PowerShell output was: {raw_json_output[:500]}") # Print first 500 chars
            # Attempt to parse as line-delimited JSON if array parsing fails
            parsed_events = []
            for line in raw_json_output.strip().split('\n'):
                try:
                    parsed_events.append(json.loads(line))
                except json.JSONDecodeError:
                    print(f"Skipping unparsable line: {line[:200]}")
            return parsed_events

    except subprocess.CalledProcessError as e:
        print(f"Error executing PowerShell: {e}")
        print(f"Stderr: {e.stderr}")
        return []
    except FileNotFoundError:
        print(f"Error: '{ps_command}' not found. Ensure PowerShell 7+ (pwsh) or Windows PowerShell is in PATH.")
        return []
```
*Note: The `ConvertTo-Json -Compress` behavior with multiple objects can be tricky. If it doesn't produce a valid single JSON array, alternative PowerShell scripting might be needed to format the output correctly, or parse line-delimited JSON in Python.*

## 4. Running a Local Test Setup (Instructions)

1.  **Run Next.js App (API Backend):**
    *   Navigate to the EventLog Analyzer project directory.
    *   Ensure PostgreSQL/TimescaleDB is running and accessible with the credentials configured in the Next.js app (e.g., via `.env.local` or directly in `src/app/api/ingest/route.ts` / `src/app/api/query/route.ts` for PoC).
    *   Run the database schema script (`create_tables.sql`) if you haven't already.
    *   Start the Next.js development server:
        ```bash
        npm run dev
        # or
        # yarn dev
        ```
    *   The `/api/ingest` endpoint should now be available at `http://localhost:3000/api/ingest`.

2.  **Run Python Agent Locally:**
    *   Save the Python agent code (e.g., `log_collector.py`).
    *   Install dependencies: `pip install requests`.
    *   Configure `INGEST_API_URL` in the agent to `http://localhost:3000/api/ingest`.
    *   Set `LOG_SOURCE_IDENTIFIER` appropriately (e.g., "windows_event_json").
    *   Run the agent from your terminal:
        ```bash
        python log_collector.py
        ```

3.  **What to Check:**
    *   **Agent Logs:**
        *   Look for messages indicating successful batch sends or any errors encountered during collection or sending.
        *   Check for API response logs (e.g., "Successfully sent X events. Response: ...").
    *   **API Logs (Next.js Console):**
        *   The Next.js development server console (where you ran `npm run dev`) should show logs from `/api/ingest`.
        *   Look for `[IngestAPI] Received X events for source: ...`
        *   Check for any normalization errors or database insertion errors logged by the API.
        *   Successful ingestion messages.
    *   **Database:**
        *   Connect to your PostgreSQL/TimescaleDB instance.
        *   Query the `events` table: `SELECT * FROM events ORDER BY ingestion_time DESC LIMIT 20;`
        *   Verify that the events sent by the agent are appearing in the database with correctly normalized fields (`event_source_name`, `event_type_id`, `parsed_fields`, etc.).
    *   **Application UI (EventLog Analyzer):** If the UI is connected to this database, new events should eventually appear in relevant views (e.g., the "Last 10 Failed Login Events" table if you send Event ID 4625).

This guide provides a solid conceptual basis for developing or adapting a Python agent to send data to the `/api/ingest` endpoint.
