# glycoreach

**A Bottleneck-Aware Framework for Inferring Glycan Biosynthetic Potential from Transcriptomics**

[Documentation](https://matsui-lab.github.io/glycoreach/) | [Interactive Explorer (Shiny)](https://133.6.53.210:3939/glycoreach/)

## Overview

`glycoreach` computes glycan biosynthetic reachability scores from gene
expression data using AND/OR logic and min-aggregation (bottleneck
principle). The method identifies capacity-limiting enzymatic steps in
glycan biosynthetic pathways, providing continuous, sample-comparable
scores of glycan biosynthetic capacity.

Five glycan families are supported, producing **23 reachability metrics**:

| Family | Metrics | Description |
|--------|---------|-------------|
| **Sialyl Lewis X** | `sLeX_reachability` | Selectin ligand biosynthesis |
| **Gangliosides** | `GM3_reach`, `GM2_reach`, `GM1_reach`, `GD3_reach` | Ganglioside series |
| **Heparan sulfate** | `HS_poly`, `PAPS`, `HS_N`, `HS_2O`, `HS_6O`, `HS_3O`, `reach_FGF_like`, `reach_WNT_like`, `reach_SHH_like` | Core chain, sulfation modules, ligand-binding profiles |
| **N-glycan processing** | `Ng_complex`, `Ng_branch`, `Ng_bisect`, `Ng_coreFuc`, `Ng_sia` | High-mannose to complex/hybrid |
| **O-GalNAc** | `OGN_Tn`, `OGN_Core1`, `OGN_Core2`, `OGN_sia` | Mucin-type glycosylation |

## Installation

```r
# install.packages("remotes")
remotes::install_github("matsui-lab/glycoreach")
```

## Quick start

```r
library(glycoreach)

# Simulate a small TPM matrix (genes x samples)
genes <- c("GNE", "NANS", "NANP", "CMAS", "SLC35A1",
           "B4GALT1", "ST3GAL4", "FUT3",
           "GMDS", "TSTA3", "SLC35C1",
           "UGP2", "GALE", "SLC35A2")
set.seed(42)
tpm <- matrix(runif(length(genes) * 5, 1, 100), nrow = length(genes),
              dimnames = list(genes, paste0("sample", 1:5)))

# Compute reachability (all pathways)
res <- compute_reachability(tpm)

# Specific pathways only
res <- compute_reachability(tpm, pathways = c("slex", "ganglioside"))

# KO simulation
res_ko <- compute_reachability(tpm, ko_genes = "FUT8")
```

## Key functions

| Function | Description |
|----------|-------------|
| `compute_reachability()` | Main entry point. Computes 23 reachability metrics from a TPM matrix. Supports pathway selection (`pathways`) and gene knockout simulation (`ko_genes`). |
| `zscore_matrix()` | Per-gene Z-score normalization: log1p(TPM) then standardize. Accepts optional pre-computed `mu`/`sd` for cross-dataset comparisons (e.g., normalize new data against GTEx reference). |
| `load_pathway_definitions()` | Returns the built-in pathway definition JSON as a nested list. Documents AND/OR logic, gene assignments, and donor substrate dependencies for all five families. |

## How it works

1. **Z-score normalization** — Per-gene log(1+TPM) Z-scores across samples
2. **OR aggregation (isozymes)** — Mean Z-score across functionally redundant enzymes (e.g., B4GALT1-6 for LacNAc)
3. **AND aggregation (pathway steps)** — Minimum Z-score across sequential steps; the bottleneck principle
4. **Donor substrate integration** — Nucleotide sugar supply chains (CMP-Sia, GDP-Fuc, UDP-Gal, UDP-GalNAc, PAPS) feed into pathway scores
5. **Ligand-binding profiles** — Configurable sulfation requirements for HS (FGF-like, WNT-like, SHH-like)

## Interactive Shiny app

The package includes a Shiny application (`app/`) for interactive exploration of GTEx tissue-level reachability.

To run locally:

```r
shiny::runApp("app")
```

A hosted version is available at: https://133.6.53.210:3939/glycoreach/

## Vignettes

- [GTEx bulk RNA-seq example](vignettes/gtex_example.Rmd)

## Citation

If you use this package, please cite:

> Matsui Y. Glycan Reachability Analysis: A Bottleneck-Aware Framework
> for Inferring Glycan Biosynthetic Potential from Transcriptomics.
> (manuscript in preparation)

## License

MIT
