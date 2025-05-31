# Python Log Collection Agent: Setup and Usage Guide

## 1. Introduction

The Python Log Collection Agent (`event_log_agent.py`) is a script designed to collect event logs from various sources on a machine and forward them to the EventLog Analyzer's central ingestion API (`/api/ingest`). This allows for the aggregation and analysis of logs from multiple endpoints.

Currently, the agent primarily supports:
*   **Windows Event Logs:** By executing configurable PowerShell commands to fetch events and convert them to JSON.
*   **Text-based Log Files:** Through basic file tailing (e.g., for application logs, syslogs stored in files).

The agent batches collected events and sends them periodically to the API, with retry mechanisms for transient network issues.

## 2. Prerequisites

Before setting up and running the agent, ensure you have the following:

*   **Python:** Python 3.7 or higher is recommended.
*   **pip:** Python package installer (usually comes with Python).
*   **PowerShell (for Windows Event Log Collection):**
    *   Windows PowerShell (typically version 5.1) is usually available by default on Windows.
    *   PowerShell 7+ (pwsh) is recommended for better `ConvertTo-Json` performance and consistency, especially with the `-Compress` flag. Ensure `pwsh.exe` or `powershell.exe` is in the system's PATH.
*   **Network Access:** The machine running the agent must have network access to the EventLog Analyzer's `/api/ingest` endpoint.

## 3. Setup

Follow these steps to set up the agent:

### 3.1. Create and Activate a Virtual Environment

It's highly recommended to run the agent in a Python virtual environment to manage its dependencies separately.

```bash
# Navigate to the directory where you have the 'agent' folder (or the project root)
# cd /path/to/your/project

# Create a virtual environment (e.g., named 'venv')
python -m venv venv

# Activate the virtual environment:
# On Windows (cmd.exe):
# venv\Scripts\activate.bat
# On Windows (PowerShell):
# .\venv\Scripts\Activate.ps1
# On macOS and Linux:
# source venv/bin/activate
```
You should see `(venv)` prefixed to your shell prompt.

### 3.2. Install Dependencies

1.  Create a `requirements.txt` file inside the `agent` directory (if it doesn't exist) with the following content:

    ```txt
    # agent/requirements.txt
    requests
    # Add other libraries like psutil if you extend the agent's functionality
    ```

2.  Install the dependencies using pip:

    ```bash
    # Ensure your virtual environment is activated
    # Navigate into the 'agent' directory if requirements.txt is there
    # cd agent
    pip install -r requirements.txt
    # If requirements.txt is in project_root/agent:
    # pip install -r agent/requirements.txt
    ```

### 3.3. Configure the Agent

The agent uses a configuration file named `config.ini` located in the same directory as the script (`agent/config.ini`).

1.  **Copy the Example Configuration:**
    In the `agent` directory, copy `config.ini.example` to `config.ini`:
    ```bash
    # Assuming you are in the project root directory
    cp agent/config.ini.example agent/config.ini
    # On Windows:
    # copy agent\config.ini.example agent\config.ini
    ```

2.  **Edit `agent/config.ini`:**
    Open `agent/config.ini` in a text editor and customize the settings according to your environment.

    #### Configuration Options:

    **`[DEFAULT]` Section:**
    These settings apply globally unless overridden in specific source sections.

    *   `INGEST_API_URL = http://localhost:3000/api/ingest`
        *   The full URL of the EventLog Analyzer's ingestion API endpoint.
    *   `LOG_SOURCE_IDENTIFIER = generic_text_log`
        *   A default identifier for log sources if not specified in a source-specific section. The API uses this to determine how to normalize the incoming raw events.
    *   `BATCH_SIZE = 10`
        *   The number of events the agent will collect in its buffer before attempting to send them to the API.
    *   `FLUSH_INTERVAL_SECONDS = 5`
        *   The maximum time (in seconds) the agent will wait before sending an incomplete batch (if the buffer is not empty). This ensures events are not held indefinitely if the `BATCH_SIZE` isn't reached frequently.
    *   `AGENT_LOG_LEVEL = INFO`
        *   The logging level for the agent's own operational messages. Options: `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`.
    *   `MAX_SEND_RETRIES = 3`
        *   The maximum number of times the agent will retry sending a batch if the API is unavailable or returns a server-side error (5xx).
    *   `INITIAL_RETRY_DELAY_SECONDS = 5`
        *   The initial delay (in seconds) before the first retry. This delay will typically double for each subsequent retry (exponential backoff).

    **`[WindowsEventLog]` Section:**
    Configuration for collecting Windows Event Logs.

    *   `ENABLED = true`
        *   Set to `true` to enable Windows Event Log collection, `false` to disable.
    *   `LOG_SOURCE_IDENTIFIER = windows_event_json`
        *   The specific identifier sent to the API for these events. The API's normalizer for "windows_event_json" is designed to parse the JSON output from PowerShell's `ConvertTo-Json`.
    *   `POWERSHELL_COMMAND = Get-WinEvent -FilterHashtable @{LogName='Security'; ID=4624,4625,4688} -MaxEvents 10 | ConvertTo-Json -Depth 5 -Compress`
        *   The PowerShell command to execute for fetching events.
        *   **Important:** For a production agent, `-MaxEvents` is too simplistic. You would typically use `-FilterHashtable` with a `TimeCreated` range or manage event bookmarks (`Get-WinEvent -Bookmark ...`) to fetch only new events since the last collection.
        *   The example fetches the last 10 events from the Security log with specific Event IDs. `ConvertTo-Json -Depth 5 -Compress` is recommended.
    *   `COLLECTION_INTERVAL_SECONDS = 30`
        *   How frequently (in seconds) the agent will execute the `POWERSHELL_COMMAND` to check for new events.

    **`[FileLog:YourLogName]` Sections (e.g., `[FileLog:ApplicationX]`):**
    Configure one or more sections for tailing text-based log files. Each section must start with `FileLog:` followed by a unique name.

    *   `ENABLED = false`
        *   Set to `true` to enable monitoring for this specific file, `false` to disable.
    *   `LOG_SOURCE_IDENTIFIER = appx_log_format`
        *   A unique identifier for this log source/format (e.g., "myapplication_log", "nginx_access_log", "syslog_rfc5424"). The API backend must have a corresponding normalizer for this identifier. If sending raw syslog lines, you might use "syslog_rfc5424".
    *   `FILE_PATH = /var/log/application_x.log`
        *   The absolute path to the log file to be monitored.
    *   `COLLECTION_INTERVAL_SECONDS = 10`
        *   How frequently (in seconds) the agent will check this file for new lines.

    **Example sections provided in `config.ini.example`:**
    *   `[FileLog:ApplicationX]`
    *   `[FileLog:SyslogLocal]` (for `/var/log/syslog`)

    You can add more `[FileLog:...]` sections as needed.

## 4. Running the Agent

1.  Ensure your virtual environment is activated (see step 3.1).
2.  Ensure `agent/config.ini` is configured correctly.
3.  Navigate to the directory containing `event_log_agent.py` (e.g., the `agent` directory or project root if running as `python agent/event_log_agent.py`).
4.  Run the script **from the project root directory**:

    Ensure your virtual environment is activated. Then, execute the agent using `python3`:

    ```bash
    # From the project root directory:
    python3 agent/event_log_agent.py
    ```

    **Important:** Always use the `python3` interpreter to start the agent (e.g., `python3 agent/event_log_agent.py`). Do not attempt to run the script directly (e.g.,`./agent/event_log_agent.py`) even if it has execute permissions. This can lead to unexpected behavior or conflicts with other system commands if your environment is configured in a certain way (e.g. ImageMagick's `import` command).
    The script includes a shebang (`#!/usr/bin/env python3`) for robustness and to indicate it's a Python 3 script, but invoking it with `python3 ...` is the recommended and safest method.

The agent will start, load the configuration, and begin collecting and sending logs based on the enabled sections and their intervals. Press `Ctrl+C` to stop the agent.

## 5. Expected Behavior & Logging

The agent will output log messages to the console. The verbosity depends on `AGENT_LOG_LEVEL`.

*   **Startup:**
    ```
    YYYY-MM-DD HH:MM:SS - EventLogAgent - INFO - Logging initialized with level: INFO
    YYYY-MM-DD HH:MM:SS - EventLogAgent - INFO - Configuration loaded from 'agent/config.ini'.
    YYYY-MM-DD HH:MM:SS - EventLogAgent - INFO - Event Log Agent started. Press Ctrl+C to exit.
    ```
*   **Event Collection (Windows Example):**
    ```
    YYYY-MM-DD HH:MM:SS - EventLogAgent - INFO - Collecting Windows events for source: windows_event_json
    YYYY-MM-DD HH:MM:SS - EventLogAgent - DEBUG - [WindowsEventLog] Executing PowerShell command: Get-WinEvent ...
    YYYY-MM-DD HH:MM:SS - EventLogAgent - INFO - Added X Windows events to buffer. Buffer size: Y
    ```
*   **Event Collection (File Log Example):**
    ```
    YYYY-MM-DD HH:MM:SS - EventLogAgent - INFO - Collecting file logs for source: appx_log_format from /var/log/application_x.log
    YYYY-MM-DD HH:MM:SS - EventLogAgent - DEBUG - [FileLog:ApplicationX] Checking file: /var/log/application_x.log
    YYYY-MM-DD HH:MM:SS - EventLogAgent - INFO - [FileLog:ApplicationX] Collected Z new lines from /var/log/application_x.log.
    YYYY-MM-DD HH:MM:SS - EventLogAgent - INFO - Added Z lines from /var/log/application_x.log to buffer. Buffer size: Y
    ```
*   **Sending Batch:**
    ```
    YYYY-MM-DD HH:MM:SS - EventLogAgent - INFO - Sending batch of N events for source 'windows_event_json' to http://localhost:3000/api/ingest
    YYYY-MM-DD HH:MM:SS - EventLogAgent - INFO - Successfully sent batch for 'windows_event_json'. API: Ingestion process completed successfully., Successful: N, Failed: 0
    ```
*   **Retry Attempt:**
    ```
    YYYY-MM-DD HH:MM:SS - EventLogAgent - WARNING - Error sending batch for 'windows_event_json' (attempt 1/3): Connection error...
    YYYY-MM-DD HH:MM:SS - EventLogAgent - INFO - Retrying in 5.0 seconds... (Attempt 1/3)
    ```
*   **Shutdown:**
    ```
    YYYY-MM-DD HH:MM:SS - EventLogAgent - INFO - Shutdown signal received. Attempting to flush remaining events...
    YYYY-MM-DD HH:MM:SS - EventLogAgent - INFO - Agent shutdown complete.
    ```

## 6. Basic Troubleshooting

*   **Configuration Errors:**
    *   "Configuration file 'agent/config.ini' not found." -> Ensure `config.ini` exists in the same directory as `event_log_agent.py` and you are running the script from that directory or providing the correct path.
    *   Errors during parsing -> Check `config.ini` for syntax issues.
*   **PowerShell Command Failures (Windows):**
    *   "'powershell.exe' not found" or "'pwsh.exe' not found" -> Ensure PowerShell is installed and its executable is in the system's PATH.
    *   "PowerShell command failed with code X: ..." -> Check the PowerShell command in `config.ini`. Test it directly in a PowerShell console. Permissions issues can also cause this (e.g., accessing certain event logs).
    *   "Failed to decode JSON from PowerShell output" -> The PowerShell command might not be outputting valid JSON, or `ConvertTo-Json` might be behaving unexpectedly with the data. Check the raw output logged.
*   **File Log Issues:**
    *   "File not found: /path/to/your.log" -> Verify `FILE_PATH` in `config.ini` is correct and the agent has read permissions.
    *   No new lines detected -> Ensure the application is writing to the log file and that the agent's state tracking for that file is correct (for this PoC, state tracking is very basic and might reset on agent restart).
*   **API Connection Errors:**
    *   `requests.exceptions.ConnectionError` -> Verify `INGEST_API_URL` is correct and the Next.js API server is running and accessible from where the agent is running. Check firewalls.
*   **API HTTP Errors:**
    *   `400 Bad Request` -> The payload sent by the agent is likely malformed or missing required fields by the API. Check agent logs and API server logs.
    *   `5xx Server Error` -> An error occurred on the API server side. Check API server logs for details. The agent should retry these.
*   **Permissions:**
    *   The agent needs appropriate permissions to read event logs (often requires Administrator/root privileges for certain logs) or tail log files.

For more detailed debugging, set `AGENT_LOG_LEVEL = DEBUG` in `config.ini`.
Check the EventLog Analyzer application's API server logs for errors related to ingestion requests.

## 7. macOS Installation Helper Script

For macOS users, a helper script `install_agent_mac.sh` is available in the project root to automate the setup of a Python virtual environment and installation of dependencies.

To use it:
1.  Navigate to the project root directory in your terminal.
2.  Make the script executable (if it isn't already): `chmod +x install_agent_mac.sh`
3.  Run the script: `./install_agent_mac.sh`

The script will guide you through the setup and provide instructions on how to activate the environment, configure, and run the agent.

**Note for macOS users:** The agent's Windows Event Log collection features will not work on macOS. You should focus on configuring file log sources (`[FileLog:...]` sections) in `agent/config.ini`. The `install_agent_mac.sh` script will remind you of this.
