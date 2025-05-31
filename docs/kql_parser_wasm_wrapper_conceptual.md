# KQL Parser Wasm Wrapper - Conceptual Outline

This document outlines the conceptual structure of a Rust-based WebAssembly (Wasm)
wrapper for the `kqlparser` crate (`irtimmer/rust-kql`). The goal is to expose
a KQL parsing function that can be called from JavaScript/TypeScript, returning
a JSON representation of the KQL Abstract Syntax Tree (AST).

## 1. `Cargo.toml` (Conceptual)

```toml
[package]
name = "kql_parser_wasm"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "rlib"] # cdylib for Wasm, rlib for testing/other Rust uses

[dependencies]
wasm-bindgen = "0.2"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

# Assuming kqlparser crate is available (e.g., from crates.io or a git submodule)
# Replace with actual path or version as needed.
# This is the parser from https://github.com/irtimmer/rust-kql
kqlparser = { git = "https://github.com/irtimmer/rust-kql", rev = "c57094a206c79929a03b076b7879cf4791979f8f" } # Example: specific commit

[profile.release]
# Optimize for small code size
opt-level = "s"
lto = true
```

## 2. `src/lib.rs` (Conceptual)

This Rust code will define the Wasm-exported function.

```rust
use wasm_bindgen::prelude::*;
use kqlparser::parser::{parse_query, Query as KqlAstQuery}; // Assuming Query is the top-level AST node from kqlparser
use serde::Serialize; // To allow KqlAstQuery to be serialized if it derives Serialize

// It's crucial that the AST structures from `kqlparser` derive `serde::Serialize`.
// If they don't, we would need to define intermediate structures that mirror the
// KQL AST and can be serialized, then map the `kqlparser` AST to these structures.
// For this conceptual example, we assume the `kqlparser::parser::Query` (or equivalent)
// can be serialized.

#[derive(Serialize)]
struct SerializableKqlAst {
    // This structure would ideally be the direct output of kqlparser if it derives Serialize.
    // If not, this is where you'd map the fields from kqlparser::parser::Query.
    // For instance, if kqlparser::parser::Query has fields like `source` and `operations`:
    // source: String,
    // operations: Vec<SomeOperationType>, // where SomeOperationType also derives Serialize
    // This is highly dependent on the actual structure of kqlparser's AST.
    // For this PoC, we'll assume we can directly serialize the parsed output.
    // A more realistic approach might involve custom structs that mirror the kqlparser AST
    // and implement Serialize.
    #[serde(flatten)] // If KqlAstQuery can be serialized directly
    query_data: KqlAstQuery,
}


#[wasm_bindgen]
pub fn parse_kql_to_json_ast(query: &str) -> Result<String, JsValue> {
    match parse_query(query) {
        Ok(parsed_kql_ast) => {
            // Assuming `parsed_kql_ast` is serializable with Serde.
            // If `kqlparser::parser::Query` itself doesn't derive `Serialize`,
            // you would map it to an intermediate struct that does.
            // For example:
            // let serializable_ast = map_to_serializable(&parsed_kql_ast);
            // serde_json::to_string(&serializable_ast)
            // For now, we'll assume direct serialization is possible or a simple wrapper.

            // Wrap the AST for serialization if needed, or serialize directly
            // let wrapper = SerializableKqlAst { query_data: parsed_kql_ast };

            // Directly try to serialize the output of parse_query.
            // This relies on the kqlparser's AST nodes deriving serde::Serialize.
            // If not, this will fail, and a manual mapping to serializable structs is required.
            match serde_json::to_string(&parsed_kql_ast) {
                Ok(json_string) => Ok(json_string),
                Err(e) => Err(JsValue::from_str(&format!("Failed to serialize AST to JSON: {}", e))),
            }
        }
        Err(parse_error) => {
            // Convert the kqlparser::parser::ParseError (or equivalent) to a string
            let error_message = format!("KQL Parsing failed: {:?}", parse_error);
            Err(JsValue::from_str(&error_message))
        }
    }
}

// Helper function for mapping (conceptual, if kqlparser AST doesn't derive Serialize)
// fn map_to_serializable(ast: &KqlAstQuery) -> SerializableKqlAst {
//     // ... mapping logic ...
//     // This would involve creating instances of your Serializable structs
//     // based on the fields of the `ast` from `kqlparser`.
// }

```

**Notes on `irtimmer/rust-kql`:**

*   The `irtimmer/rust-kql` parser returns a specific AST structure defined within that crate.
*   For `serde_json::to_string` to work directly on the `kqlparser` AST, those AST node types would need to derive `serde::Serialize`.
*   If they do not, a manual mapping step is required:
    1.  Define Rust structs in the Wasm wrapper that mirror the structure of the `kqlparser` AST (or the subset you care about).
    2.  These structs must derive `serde::Serialize`.
    3.  After parsing with `kqlparser::parser::parse_query`, manually traverse the returned `kqlparser` AST and populate your serializable structs.
    4.  Then, serialize your custom structs to JSON.
*   The JSON string produced by `serde_json` would then be parsed on the JavaScript side. This JSON structure would initially be the one defined by the `kqlparser` (or your serializable wrapper). A subsequent transformation step in TypeScript might be needed to convert this "Rust-native" AST JSON into the specific `QueryNode` TypeScript AST structure used by the rest of the application (as defined in `src/lib/kql_ast.ts`). This transformation ensures the Wasm parser's output matches the existing AST expectations of the transpiler.

This conceptual outline provides a starting point for building the Wasm component. The TypeScript simulation in `kql_parser_real.ts` will mock the *final JSON output after it has been transformed to match `QueryNode`*, not the direct JSON from the Rust parser.
