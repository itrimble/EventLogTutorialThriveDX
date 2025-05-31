# KQL Parser Wasm Wrapper - Detailed Conceptual Outline

This document provides a more detailed conceptual structure for a Rust-based WebAssembly (Wasm)
wrapper for the `kqlparser` crate (specifically targeting the one from `irtimmer/rust-kql`).
The aim is to create a Wasm module that can parse a KQL query string and return its
Abstract Syntax Tree (AST) serialized as a JSON string.

## 1. `Cargo.toml` (Conceptual)

```toml
[package]
name = "kqlparser_wasm_lib"
version = "0.1.0"
edition = "2021"
authors = ["Your Name <you@example.com>"] # Optional
description = "A Wasm wrapper for the KQL parser." # Optional
license = "MIT OR Apache-2.0" # Optional, choose a license

[lib]
crate-type = ["cdylib"] # Critical for Wasm shared library output

[dependencies]
wasm-bindgen = "0.2" # For interfacing between Rust and JavaScript

# Serde for serialization/deserialization
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0" # For serializing the AST to a JSON string

# The KQL Parser crate from irtimmer/rust-kql
# This assumes you have it available, possibly as a local path if you've forked it
# to add `Serialize` derives, or using a specific git revision.
# Option 1: Git dependency (if the original crate or a fork supports `Serialize`)
kqlparser = { git = "https://github.com/irtimmer/rust-kql.git", rev = "c57094a206c79929a03b076b7879cf4791979f8f" } # Using the last known commit from that repo
# Note: The `irtimmer/rust-kql` crate's AST structures (like `kqlparser::ast::Query`)
# MUST derive `serde::Serialize` for direct serialization. If not, a manual mapping
# to serializable structs within this wrapper crate would be necessary (see src/lib.rs).

# Option 2: Local path dependency (if you've cloned/forked `rust-kql` locally)
# kqlparser = { path = "../path/to/rust-kql/kqlparser" }

[profile.release]
# Optimize for size and speed, common for Wasm.
opt-level = "s"  # Optimize for size. 'z' is also an option.
lto = true         # Link-Time Optimization
codegen-units = 1  # Maximize optimizations
panic = "abort"    # Abort on panic to reduce Wasm size (alternative: "unwind")
```

## 2. `src/lib.rs` (Conceptual)

This Rust code defines the Wasm-exported function.

```rust
use wasm_bindgen::prelude::*;
use kqlparser::parser::parse_query;
// Import the Query struct from the kqlparser::ast module.
// The exact path might vary based on the kqlparser crate's structure.
// Example: use kqlparser::ast::Query;
// For irtimmer/rust-kql, the top-level AST node is indeed `kqlparser::ast::Query`.
use kqlparser::ast::Query as KqlRustAst; // Alias for clarity

// IMPORTANT ASSUMPTION:
// The following implementation assumes that the `KqlRustAst` (i.e., `kqlparser::ast::Query`)
// and all its nested AST node types from the `kqlparser` crate have been modified
// to derive `serde::Serialize`. If this is not the case, `serde_json::to_string`
// will not work directly. In such a scenario, you would need to:
//   1. Define your own set of Rust structs that mirror the structure of `KqlRustAst`.
//   2. Make your structs derive `serde::Serialize`.
//   3. Write a manual mapping function: `fn map_kql_ast_to_serializable(kql_ast: &KqlRustAst) -> MySerializableAst;`
//   4. Call this mapping function before serializing.

#[wasm_bindgen]
pub fn parse_kql_to_json_ast_string(kql_query: &str) -> Result<String, JsValue> {
    // Log that the function was called (optional, for debugging in Wasm)
    // wasm_bindgen_console_logger::init_with_level(log::Level::Debug).expect("Error initializing logger");
    // log::debug!("parse_kql_to_json_ast_string called with query: {}", kql_query);

    match parse_query(kql_query) {
        Ok(parsed_query_ast) => { // parsed_query_ast is of type kqlparser::ast::Query
            // Attempt to serialize the Rust AST directly to a JSON string.
            // This requires `KqlRustAst` and its members to derive `serde::Serialize`.
            match serde_json::to_string(&parsed_query_ast) {
                Ok(json_string) => {
                    // log::debug!("Successfully serialized AST to JSON: {}", json_string);
                    Ok(json_string)
                }
                Err(e) => {
                    // log::error!("AST Serialization Error: {}", e);
                    Err(JsValue::from_str(&format!("AST Serialization Error: {}", e)))
                }
            }
        }
        Err(nom_error) => {
            // `nom::Err` can be complex. Formatting it for a useful JS error message is important.
            // `nom_error.to_string()` provides a basic representation.
            // For more detailed errors, you might need to inspect the `nom::Err<E>` structure.
            let error_message = format!("KQL Parsing Error: {}", nom_error.to_string());
            // log::error!("{}", error_message);
            Err(JsValue::from_str(&error_message))
        }
    }
}
```

## 3. Build Command

To compile the Rust code to Wasm, you would use `wasm-pack`:

```bash
# Ensure wasm-pack is installed: cargo install wasm-pack
wasm-pack build --target nodejs --out-dir ./pkg
# or --target web for direct browser usage
# or --target bundler for use with webpack/rollup
```
This command compiles the Rust library into a Wasm package in the `pkg` directory (or your specified `--out-dir`). The `--target nodejs` flag makes it suitable for use in a Node.js environment like Next.js API routes.

## 4. Notes on `irtimmer/rust-kql` AST and Serialization

*   **`serde::Serialize` Requirement:** As highlighted, the biggest challenge for direct integration is ensuring the AST types in `irtimmer/rust-kql` derive `serde::Serialize`. If they don't, forking the crate to add these derives or implementing a manual mapping layer (Rust AST from parser -> Your Serializable Rust AST -> JSON) is necessary. The manual mapping is safer if you cannot modify the original crate or want to decouple your JSON structure from the parser's internal AST.
*   **AST Structure:** The JSON output will directly reflect the structure of `kqlparser::ast::Query` (and its nested types like `TabularOperator`, `Expression`, etc.). The TypeScript side (`kql_ast_transformer.ts`) will then be responsible for transforming this "Rust KQL AST JSON" into the `QueryNode` AST structure used by the application's SQL transpiler. This transformation step is crucial for decoupling the internal parser details from the rest of the TypeScript application.

This detailed conceptual outline should guide the actual implementation of the Wasm module.
