# Local Development Setup Guide

This guide provides instructions for setting up and running the EventLog Analyzer application locally for development and testing purposes.

## 1. Prerequisites

Ensure you have the following software installed on your system:

*   **Node.js:** (LTS version recommended, e.g., v18.x or v20.x)
*   **npm** (usually comes with Node.js) or **yarn**
*   **Docker:** For running the PostgreSQL/TimescaleDB database container.
*   **Docker Compose:** For simplifying the management of Docker containers.
*   **Git:** For cloning the repository.

## 2. Clone the Repository

If you haven't already, clone the project repository to your local machine:

```bash
git clone <repository_url>
cd <repository_directory_name>
```

## 3. Configure Environment Variables

The application uses environment variables for database connection details and other settings.

*   Locate the example environment file: `.env.local.example` in the project root.
*   Create a copy of this file and name it `.env.local`:

    ```bash
    cp .env.local.example .env.local
    ```
*   Review the variables in `.env.local`. The default values are pre-configured to work with the Docker Compose setup provided in `docker-compose.yml`:
    ```ini
    # PostgreSQL Connection Details
    PGHOST=localhost
    PGPORT=5432
    PGDATABASE=eventlog_dev
    PGUSER=eventlogger
    PGPASSWORD=localdevpassword
    ```
    You typically do not need to change these if using the provided Docker setup.

## 4. Start the Database Container

The project includes a `docker-compose.yml` file to easily set up a PostgreSQL database with the TimescaleDB extension.

*   Open your terminal in the project root directory.
*   Run the following command to start the database service in detached mode:

    ```bash
    docker-compose up -d db
    ```
    *   The `db` argument specifies to only start the service named `db` in the `docker-compose.yml`. If you just run `docker-compose up -d`, it will start all services defined (if there are others).
    *   On the first run, Docker will download the `timescale/timescaledb` image, which might take a few minutes.
    *   Subsequent starts will be much faster.
    *   The database will store its data in a Docker volume named `pgdata_eventlog` (defined in `docker-compose.yml`), so your data will persist across container restarts.

*   **To check if the database container is running:**
    ```bash
    docker-compose ps
    # or
    # docker ps
    ```
    You should see a container named `eventlog_db_timescale_local` (or similar, based on `container_name` in `docker-compose.yml`) with status "Up" or "Up (healthy)".

## 5. Initialize Database Schema

After the database container is running (especially for the very first time, or if you've cleared the data volume), you need to create the necessary tables and hypertables.

*   The `create_tables.sql` script (located in the project root) defines the schema.
*   **Option 1: Using `docker-compose exec` (Recommended for first-time setup):**
    Make sure the `create_tables.sql` file is in your project root. From your project root directory, run:
    ```bash
    docker-compose exec -T db psql -U eventlogger -d eventlog_dev < create_tables.sql
    ```
    *   `db`: This is the service name of your database in `docker-compose.yml`.
    *   `-T`: Disables pseudo-tty allocation, which is often needed when piping input.
    *   `psql -U eventlogger -d eventlog_dev`: Connects to the `eventlog_dev` database as the `eventlogger` user (credentials from `docker-compose.yml` and `.env.local`).
    *   `< create_tables.sql`: Pipes the content of `create_tables.sql` into `psql` for execution.
    You should see output like `CREATE EXTENSION`, `CREATE TABLE`, `CREATE INDEX`, `SELECT` (for `create_hypertable`). No output usually means success for DDL commands in `psql` when piped.

*   **Option 2: Automatic Initialization via `docker-entrypoint-initdb.d` (Alternative):**
    If you uncommented or added the volume mount for `create_tables.sql` in `docker-compose.yml` like this:
    ```yaml
    # services:
    #   db:
    #     volumes:
    #       - ./create_tables.sql:/docker-entrypoint-initdb.d/01_init_schema.sql
    ```
    The script will run automatically ONLY when the database is initialized for the first time (i.e., when the `pgdata_eventlog` volume is empty). If the volume already exists from a previous run, these init scripts are skipped. If you use this method and need to re-run the script, you'd have to stop the container, remove the volume (`docker volume rm projectname_pgdata_eventlog`), and then run `docker-compose up -d db` again.

*   **Option 3: Using a Database GUI:**
    1.  Connect to the database using your preferred GUI tool (see step 8).
    2.  Open `create_tables.sql` in the GUI's query editor.
    3.  Execute the entire script.

## 6. Install Project Dependencies

Once the database is set up, install the Next.js application's dependencies:

```bash
npm install
# or
# yarn install
```

## 7. Run the Next.js Application

Start the Next.js development server:

```bash
npm run dev
# or
# yarn dev
```
The application should now be running, typically at `http://localhost:3000`. The API endpoints (e.g., `/api/ingest`, `/api/query`) will be available.

## 8. (Optional) Connect with a Database GUI

You can connect to the PostgreSQL database running in Docker using any standard SQL client or GUI for browsing data, running queries, or managing the database.

*   **Connection Details:**
    *   Host: `localhost`
    *   Port: `5432`
    *   Database: `eventlog_dev`
    *   User: `eventlogger`
    *   Password: `localdevpassword`
*   **Suggested Tools:**
    *   **pgAdmin:** A comprehensive PostgreSQL administration and development platform.
    *   **DBeaver:** A free, multi-platform universal database tool.
    *   **VS Code SQLTools Extension:** With the PostgreSQL driver.

## Stopping the Database Container

To stop the database container when you're done with development for the session:

```bash
docker-compose stop db
```
Or to stop and remove containers (but not the data volume):
```bash
docker-compose down
```
Your data will remain in the `pgdata_eventlog` Docker volume. The next time you run `docker-compose up -d db`, the database will start with its existing data.
