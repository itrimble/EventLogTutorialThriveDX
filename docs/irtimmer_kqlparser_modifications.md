# Modifications for `irtimmer/rust-kql/kqlparser` for Wasm Serialization

To enable the `irtimmer/rust-kql/kqlparser` crate's AST to be serialized to JSON and used in a WebAssembly (Wasm) context, the following conceptual modifications would be necessary. These changes primarily involve adding `serde` support.

**Note:** These modifications assume you are working with a local clone or fork of the `irtimmer/rust-kql` repository, specifically its `kqlparser` sub-crate.

## 1. `kqlparser/Cargo.toml` Modifications

The `serde` and `serde_json` dependencies need to be added. It's good practice to make these optional and enable them via a feature flag (e.g., "serialization") so that users of the crate who don't need serialization aren't forced to compile these dependencies.

```diff
--- a/kqlparser/Cargo.toml
+++ b/kqlparser/Cargo.toml
@@ -1,6 +1,6 @@
 [package]
 name = "kqlparser"
-version = "0.1.0"
+version = "0.1.1" # Example: increment version
 authors = ["Iem Reijmer <iemreijmer@gmail.com>"]
 edition = "2021"
 description = "A parser for the Kusto Query Language (KQL)"
@@ -10,10 +10,18 @@
 [dependencies]
 nom = "7.1.3"
 nom_locate = "4.0.0"
+serde = { version = "1.0", features = ["derive"], optional = true }
+serde_json = { version = "1.0", optional = true }

 [dev-dependencies]
 pretty_assertions = "1.3.0"

+[features]
+default = []
+serialization = ["dep:serde", "dep:serde_json"]
+
 # See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

```

**Explanation:**
*   `serde = { version = "1.0", features = ["derive"], optional = true }`: Adds `serde` and its `derive` feature for easily deriving `Serialize` and `Deserialize` traits. `optional = true` makes it not included by default.
*   `serde_json = { version = "1.0", optional = true }`: Adds `serde_json` for JSON serialization/deserialization, also optional.
*   `[features]` section:
    *   `default = []`: Ensures no features are enabled by default.
    *   `serialization = ["dep:serde", "dep:serde_json"]`: Defines a new feature named "serialization". When this feature is enabled by a dependent crate (like our Wasm wrapper), it will activate the `serde` and `serde_json` dependencies.

## 2. `kqlparser/src/ast.rs` Modifications

All structs and enums that form the Abstract Syntax Tree (AST) and need to be part of the JSON output must derive `serde::Serialize`.

First, add the `use` declaration at the top of `ast.rs`:

```rust
// At the top of kqlparser/src/ast.rs
#[cfg(feature = "serialization")] // Only include if 'serialization' feature is enabled
use serde::Serialize;
```

Then, for each relevant struct and enum, add `#[cfg_attr(feature = "serialization", derive(Serialize))]`. This conditionally adds `#[derive(Serialize)]` only when the "serialization" feature is active.

**Examples (illustrative, based on `irtimmer/rust-kql` structure):**

You would need to go through `kqlparser/src/ast.rs` and apply this to all public AST node types. Key candidates include:

*   `Query`
*   `TabularOperator` (enum) and its variants (e.g., `Where`, `Project`, `Summarize`, `SortBy`, `Limit`, `Extend`, etc.)
*   `Expression` (enum) and its variants (e.g., `Literal`, `Column`, `BinaryExpression`, `FunctionCall`, `Path`, etc.)
*   `LiteralValue` (enum)
*   `SimpleExpression` (enum)
*   `SortOperator`
*   `SummarizeOperator`
*   `NamedExpression`
*   `Aggregation`
*   `SortClause`
*   `Function` (if it's a distinct struct/enum for function names)
*   Any other nested structs or enums that these types contain.

**Example of how to modify a struct:**

```rust
// Original struct in ast.rs
// pub struct Query<'a> { ... }

// Modified struct
#[cfg_attr(feature = "serialization", derive(Serialize))]
#[derive(Debug, PartialEq, Clone)] // Assuming existing derives
pub struct Query<'a> {
    pub source: SimpleExpression<'a>,
    pub operations: Vec<TabularOperator<'a>>,
}
```

**Example of how to modify an enum:**

```rust
// Original enum in ast.rs
// pub enum TabularOperator<'a> { ... }

// Modified enum
#[cfg_attr(feature = "serialization", derive(Serialize))]
#[derive(Debug, PartialEq, Clone)] // Assuming existing derives
pub enum TabularOperator<'a> {
    Project { columns: Vec<NamedExpression<'a>> },
    Where { predicate: Expression<'a> },
    Limit { count: Expression<'a> },
    // ... other variants
}
```

**Important Considerations:**
*   **Completeness:** Every single struct and enum that is part of the AST structure reachable from `Query` and intended for serialization must have the `Serialize` derive applied. If a nested type is missed, serialization will fail.
*   **Lifetime Parameters (`<'a>`):** `serde::Serialize` can generally handle lifetimes correctly if all referenced types also implement `Serialize`.
*   **External Crates:** If any AST types directly include types from other crates (e.g., `chrono::DateTime` if it were used directly, though `irtimmer/rust-kql` seems to use custom types or strings for timestamps/datetimes in literals), those external types must also support `Serialize` or be wrapped/converted.
*   **Testing:** After these changes, it would be crucial to add tests within the `kqlparser` crate (perhaps under a `#[cfg(feature = "serialization")]` module) that parse some KQL queries and attempt to serialize the resulting AST to JSON using `serde_json::to_string` to verify correctness.

These modifications would make the `kqlparser` crate's AST serializable, allowing the Wasm wrapper to then convert it to a JSON string.
