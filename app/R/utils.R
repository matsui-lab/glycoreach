# Shared constants and utility functions for GTEx Glycan Reachability Explorer

# --- 23 Reachability Metrics (pathway-family order) ---
METRICS <- c(

  "sLeX_reachability",
  "GM3_reach", "GM2_reach", "GM1_reach", "GD3_reach",
  "Ng_complex", "Ng_branch", "Ng_bisect", "Ng_coreFuc", "Ng_sia",
  "OGN_Tn", "OGN_Core1", "OGN_Core2", "OGN_sia",
  "HS_poly", "PAPS", "HS_N", "HS_2O", "HS_6O", "HS_3O",
  "reach_FGF_like", "reach_WNT_like", "reach_SHH_like"
)

# --- Short display names ---
METRIC_SHORT <- c(
  sLeX_reachability = "sLeX",
  GM3_reach = "GM3", GM2_reach = "GM2", GM1_reach = "GM1", GD3_reach = "GD3",
  Ng_complex = "Ng_cplx", Ng_branch = "Ng_br", Ng_bisect = "Ng_bis",
  Ng_coreFuc = "Ng_cFuc", Ng_sia = "Ng_sia",
  OGN_Tn = "OGN_Tn", OGN_Core1 = "OGN_C1", OGN_Core2 = "OGN_C2",
  OGN_sia = "OGN_sia",
  HS_poly = "HS_poly", PAPS = "PAPS", HS_N = "HS_N",
  HS_2O = "HS_2O", HS_6O = "HS_6O", HS_3O = "HS_3O",
  reach_FGF_like = "FGF", reach_WNT_like = "WNT", reach_SHH_like = "SHH"
)

# --- Metric → family mapping ---
METRIC_FAMILY <- setNames(
  c("sLeX",
    rep("Ganglio", 4),
    rep("N-glycan", 5),
    rep("O-GalNAc", 4),
    rep("HS", 9)),
  METRICS
)

# --- 5 pathway-family colors ---
FAMILY_COLORS <- c(
  sLeX      = "#E65100",
  Ganglio   = "#C62828",
  `N-glycan`  = "#00695C",
  `O-GalNAc`  = "#4A148C",
  HS        = "#1565C0"
)

# --- tissue_detail → 14 system categories ---
tissue_system <- function(tis) {
  vapply(tis, function(t) {
    if (grepl("^Brain", t)) return("Brain")
    if (grepl("^Heart", t)) return("Heart")
    if (grepl("^Artery|^Aorta", t)) return("Vascular")
    if (grepl("Adipose", t)) return("Adipose")
    if (grepl("Skin|Fibroblast", t)) return("Skin/Fibro")
    if (grepl("Esophagus|Colon|Stomach|Small Intestine|Liver|Pancreas", t)) return("GI/Digestive")
    if (grepl("Muscle|Skeletal", t)) return("Muscle")
    if (grepl("Blood|Spleen|Lymphocyte", t)) return("Blood/Immune")
    if (grepl("Lung", t)) return("Lung")
    if (grepl("Kidney", t)) return("Kidney")
    if (grepl("Nerve", t)) return("Nerve")
    if (grepl("Testis|Ovary|Uterus|Vagina|Prostate|Fallopian|Cervix|Breast", t)) return("Reproductive")
    if (grepl("Thyroid|Adrenal|Pituitary", t)) return("Endocrine")
    return("Other")
  }, character(1), USE.NAMES = FALSE)
}

# --- 14 tissue-system colors ---
TISSUE_SYS_COLS <- c(
  Brain         = "#8C6BB1",
  Heart         = "#E31A1C",
  Vascular      = "#FB6A4A",
  Adipose       = "#FEC44F",
  `Skin/Fibro`  = "#D9F0A3",
  `GI/Digestive`= "#41AB5D",
  Muscle        = "#EF6548",
  `Blood/Immune`= "#FC8D59",
  Lung          = "#67A9CF",
  Kidney        = "#A6611A",
  Nerve         = "#018571",
  Reproductive  = "#DFC27D",
  Endocrine     = "#80CDC1",
  Other         = "#BDBDBD"
)

# --- Abbreviate tissue names for compact display ---
abbrev_tissue <- function(x) {
  x <- gsub("Brain - ", "Br-", x)
  x <- gsub("Artery - ", "Art-", x)
  x <- gsub("Esophagus - ", "Eso-", x)
  x <- gsub("Adipose - ", "Ad-", x)
  x <- gsub("Heart - ", "Ht-", x)
  x <- gsub("Skin - ", "Sk-", x)
  x <- gsub("Colon - ", "Co-", x)
  x <- gsub("Kidney - ", "Kd-", x)
  x <- gsub("Cells - EBV-transformed lymphocytes", "EBV-lymph", x)
  x <- gsub("Cells - Cultured fibroblasts", "Fibroblasts", x)
  x <- gsub("Minor Salivary Gland", "Saliv.Gland", x)
  x <- gsub("Muscle - Skeletal", "Skel.Muscle", x)
  x <- gsub("Nerve - Tibial", "Nerve-Tib", x)
  x <- gsub("Small Intestine - Terminal Ileum", "SmInt-TI", x)
  x <- gsub("Whole Blood", "Blood", x)
  x <- gsub(" \\(Lower leg\\)", "", x)
  x <- gsub(" \\(Suprapubic\\)", "", x)
  x <- gsub("Sun Exposed", "SunExp", x)
  x <- gsub("Not Sun Exposed", "NoSun", x)
  x <- gsub("Subcutaneous", "SubQ", x)
  x <- gsub("Visceral \\(Omentum\\)", "Visc", x)
  x <- gsub("Gastroesophageal Junction", "GEJ", x)
  x
}

# --- Cascade definitions for Tab 7 ---
CASCADES <- list(
  WNT = list(
    key = "WNT", reach = "reach_WNT_like", family = "HS",
    rec_label = "Frizzled/LRP", ds_label = "WNT targets"
  ),
  SHH = list(
    key = "SHH", reach = "reach_SHH_like", family = "HS",
    rec_label = "PTCH1/SMO", ds_label = "Hedgehog targets"
  ),
  EGFR = list(
    key = "EGFR", reach = "GM3_reach", family = "Ganglio",
    rec_label = "EGFR", ds_label = "EGFR targets"
  ),
  Selectin = list(
    key = "Selectin", reach = "sLeX_reachability", family = "sLeX",
    rec_label = "Selectins", ds_label = "Adhesion molecules"
  )
)
