# ui.R — GTEx Glycan Reachability Explorer

navbarPage(
  title = "GTEx Glycan Reachability Explorer",
  theme = bslib::bs_theme(bootswatch = "flatly"),

  # ── Tab 1: Overview ──
  tabPanel("Overview",
    fluidRow(
      column(12,
        h4("Tissue × Metric Heatmap (Z-scaled medians)"),
        plotlyOutput("overview_heatmap", height = "900px")
      )
    ),
    hr(),
    fluidRow(
      column(12,
        h4("Kruskal-Wallis Test (tissue effect per metric)"),
        DTOutput("overview_kw_table")
      )
    )
  ),

  # ── Tab 2: Tissue Explorer ──
  tabPanel("Tissue Explorer",
    sidebarLayout(
      sidebarPanel(width = 3,
        selectInput("tissue_sel", "Select Tissue:",
                    choices = NULL)
      ),
      mainPanel(width = 9,
        h4(textOutput("tissue_title")),
        plotlyOutput("tissue_boxplot", height = "500px"),
        hr(),
        h4("Sample-level Data"),
        DTOutput("tissue_sample_table")
      )
    )
  ),

  # ── Tab 3: Metric Explorer ──
  tabPanel("Metric Explorer",
    sidebarLayout(
      sidebarPanel(width = 3,
        selectInput("metric_sel", "Select Metric:",
                    choices = NULL)
      ),
      mainPanel(width = 9,
        h4(textOutput("metric_title")),
        plotlyOutput("metric_boxplot", height = "600px"),
        hr(),
        h4("Effect Size Summary"),
        DTOutput("metric_effect_table")
      )
    )
  ),

  # ── Tab 4: Pairwise Comparison ──
  tabPanel("Pairwise Comparison",
    sidebarLayout(
      sidebarPanel(width = 3,
        selectInput("pw_tissue1", "Tissue 1:", choices = NULL),
        selectInput("pw_tissue2", "Tissue 2:", choices = NULL),
        hr(),
        selectInput("pw_heatmap_metric", "Signed Heatmap Metric:",
                    choices = NULL)
      ),
      mainPanel(width = 9,
        h4("Median Difference (Tissue 1 vs Tissue 2)"),
        plotlyOutput("pw_bar", height = "400px"),
        hr(),
        h4("Pairwise Statistics"),
        DTOutput("pw_stats_table"),
        hr(),
        h4("All-Tissue Signed Heatmap"),
        plotlyOutput("pw_heatmap", height = "900px")
      )
    )
  ),

  # ── Tab 5: Aging Analysis ──
  tabPanel("Aging Analysis",
    fluidRow(
      column(12,
        h4("Spearman ρ: Tissue × Metric (age correlation)"),
        plotlyOutput("aging_heatmap", height = "900px")
      )
    ),
    hr(),
    fluidRow(
      column(3,
        selectInput("aging_tissue", "Tissue:", choices = NULL),
        selectInput("aging_metric", "Metric:", choices = NULL)
      ),
      column(9,
        h4("Age Trajectory"),
        plotlyOutput("aging_trajectory", height = "400px")
      )
    ),
    hr(),
    fluidRow(
      column(12,
        h4("Direction Summary (per metric)"),
        plotlyOutput("aging_summary_bar", height = "350px")
      )
    )
  ),

  # ── Tab 6: PCA ──
  tabPanel("PCA",
    sidebarLayout(
      sidebarPanel(width = 3,
        selectInput("pca_y", "Y axis:",
                    choices = c("PC2", "PC3"), selected = "PC2")
      ),
      mainPanel(width = 9,
        h4("Tissue PCA Biplot (glycogene expression)"),
        plotlyOutput("pca_biplot", height = "550px"),
        hr(),
        h4("Top Gene Loadings"),
        DTOutput("pca_loadings_table")
      )
    )
  ),

  # ── Tab 7: Cascade Validation ──
  tabPanel("Cascade Validation",
    fluidRow(
      column(12,
        h4("Reachability \u2192 Receptor / Downstream Correlation (published cascades)"),
        plotlyOutput("cascade_bar", height = "400px")
      )
    ),
    hr(),
    fluidRow(
      column(12,
        h4("Aggregation Method Comparison"),
        plotlyOutput("aggregation_bar", height = "400px"),
        hr(),
        DTOutput("aggregation_table")
      )
    ),
    hr(),
    h3("Exploratory Cascade Analysis"),
    p("Test arbitrary reachability metric \u00d7 gene correlations across tissues.",
      "Select a metric and gene(s) to compute Spearman \u03c1 on tissue-level medians."),
    sidebarLayout(
      sidebarPanel(width = 3,
        selectInput("explore_metric", "Reachability Metric:", choices = NULL),
        selectizeInput("explore_genes", "Gene(s):",
                       choices = NULL, multiple = TRUE,
                       options = list(maxItems = 10,
                                     placeholder = "Type gene name...")),
        actionButton("explore_go", "Compute", class = "btn-primary"),
        hr(),
        h5("Screen all genes"),
        p("Find top correlated genes for the selected metric.", style = "font-size: 0.85em;"),
        numericInput("screen_top_n", "Top N:", value = 30, min = 10, max = 200, step = 10),
        actionButton("screen_go", "Screen", class = "btn-info")
      ),
      mainPanel(width = 9,
        conditionalPanel(
          condition = "input.explore_go > 0 || input.screen_go > 0",
          h4("Scatter: Tissue Median Reachability vs Gene Expression"),
          plotlyOutput("explore_scatter", height = "450px"),
          hr(),
          h4("Correlation Results"),
          DTOutput("explore_corr_table")
        )
      )
    )
  )
)
