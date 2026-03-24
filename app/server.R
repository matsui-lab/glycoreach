# server.R — GTEx Glycan Reachability Explorer

# Common DT options with download buttons (CSV, TSV, Excel)
dt_download_opts <- function(pageLength = 20, extra_dom = "") {
  list(
    pageLength = pageLength,
    scrollX = TRUE,
    dom = paste0("Bfrtip", extra_dom),
    buttons = list(
      list(extend = "csv",  text = "CSV",  title = NULL,
           exportOptions = list(modifier = list(page = "all"))),
      list(extend = "csv",  text = "TSV",  title = NULL,
           fieldSeparator = "\t", extension = ".tsv",
           exportOptions = list(modifier = list(page = "all"))),
      list(extend = "excel", text = "Excel", title = NULL,
           exportOptions = list(modifier = list(page = "all")))
    )
  )
}

function(input, output, session) {

  # ── Populate dropdowns on startup ──
  observe({
    metric_choices <- setNames(METRICS, METRIC_SHORT[METRICS])
    updateSelectInput(session, "tissue_sel",  choices = all_tissues)
    updateSelectInput(session, "metric_sel",  choices = metric_choices)
    updateSelectInput(session, "pw_tissue1",  choices = all_tissues, selected = all_tissues[1])
    updateSelectInput(session, "pw_tissue2",  choices = all_tissues, selected = all_tissues[2])
    updateSelectInput(session, "pw_heatmap_metric", choices = metric_choices)
    aging_tissues <- sort(unique(aging_spearman$tissue))
    updateSelectInput(session, "aging_tissue", choices = aging_tissues)
    updateSelectInput(session, "aging_metric", choices = metric_choices)
    updateSelectInput(session, "explore_metric", choices = metric_choices)
    updateSelectizeInput(session, "explore_genes", choices = all_genes_available,
                         server = TRUE)
  })

  # ========================================================================
  # Tab 1: Overview
  # ========================================================================

  output$overview_heatmap <- renderPlotly({
    mat <- as.data.frame(tissue_median_mat)
    rownames(mat) <- abbrev_tissue(mat$tissue_detail)
    mat$tissue_detail <- NULL
    # Z-scale columns
    mat_z <- scale(as.matrix(mat))
    colnames(mat_z) <- METRIC_SHORT[colnames(mat)]
    heatmaply(mat_z,
              colors = colorRampPalette(c("#2166AC", "white", "#B2182B"))(256),
              xlab = "Metric", ylab = "",
              main = "", margins = c(80, 200, 10, 10),
              fontsize_row = 9, fontsize_col = 9,
              dendrogram = "both",
              key.title = "Z-score",
              plot_method = "plotly",
              height = max(700, nrow(mat_z) * 18))
  })

  output$overview_kw_table <- renderDT(server = FALSE, {
    df <- kruskal_wallis[order(kw_pval)]
    df[, short := METRIC_SHORT[metric]]
    df[, family := METRIC_FAMILY[metric]]
    df[, kw_pval := signif(kw_pval, 3)]
    df[, kw_chi2 := round(kw_chi2, 1)]
    datatable(df[, .(Metric = short, Family = family,
                     `Chi-squared` = kw_chi2, df = kw_df, `p-value` = kw_pval)],
              extensions = "Buttons",
              options = dt_download_opts(pageLength = 23),
              rownames = FALSE)
  })

  # ========================================================================
  # Tab 2: Tissue Explorer
  # ========================================================================

  output$tissue_title <- renderText({
    req(input$tissue_sel)
    n <- nrow(dat[tissue_detail == input$tissue_sel])
    paste0(input$tissue_sel, " (n = ", n, ")")
  })

  output$tissue_boxplot <- renderPlotly({
    req(input$tissue_sel)
    sub <- dat[tissue_detail == input$tissue_sel]
    melt_dt <- melt(sub, id.vars = "sample", measure.vars = METRICS,
                    variable.name = "metric", value.name = "value")
    melt_dt[, short := METRIC_SHORT[as.character(metric)]]
    melt_dt[, family := METRIC_FAMILY[as.character(metric)]]
    melt_dt[, short := factor(short, levels = METRIC_SHORT)]

    p <- plot_ly(melt_dt, x = ~short, y = ~value, color = ~family,
                 colors = FAMILY_COLORS, type = "box",
                 boxpoints = FALSE) %>%
      layout(xaxis = list(title = "", tickangle = 45),
             yaxis = list(title = "Reachability (Z-score)"),
             showlegend = TRUE,
             legend = list(title = list(text = "Family")))
    p
  })

  output$tissue_sample_table <- renderDT(server = FALSE, {
    req(input$tissue_sel)
    sub <- dat[tissue_detail == input$tissue_sel]
    cols <- c("sample", "subject", "sex", "age", "death_hardy", METRICS)
    cols <- intersect(cols, names(sub))
    df <- as.data.frame(sub[, ..cols])
    # Round numeric columns
    num_cols <- names(df)[sapply(df, is.numeric)]
    for (col in num_cols) df[[col]] <- round(df[[col]], 3)
    datatable(df, extensions = "Buttons",
              options = dt_download_opts(pageLength = 10),
              rownames = FALSE, filter = "top")
  })

  # ========================================================================
  # Tab 3: Metric Explorer
  # ========================================================================

  output$metric_title <- renderText({
    req(input$metric_sel)
    paste0(METRIC_SHORT[input$metric_sel], " (", input$metric_sel, ")")
  })

  output$metric_boxplot <- renderPlotly({
    req(input$metric_sel)
    m <- input$metric_sel
    sub <- dat[, .(value = get(m), tissue_detail, system)]
    # Sort tissues by median
    med_order <- sub[, .(med = median(value, na.rm = TRUE)), by = tissue_detail][order(med)]
    sub[, tissue_short := abbrev_tissue(tissue_detail)]
    sub[, tissue_short := factor(tissue_short,
          levels = abbrev_tissue(med_order$tissue_detail))]

    p <- plot_ly(sub, y = ~tissue_short, x = ~value, color = ~system,
                 colors = TISSUE_SYS_COLS, type = "box",
                 orientation = "h", boxpoints = FALSE) %>%
      layout(yaxis = list(title = ""),
             xaxis = list(title = paste0(METRIC_SHORT[m], " (Z-score)")),
             showlegend = TRUE,
             legend = list(title = list(text = "System")),
             height = max(400, length(unique(sub$tissue_detail)) * 14))
    p
  })

  output$metric_effect_table <- renderDT(server = FALSE, {
    req(input$metric_sel)
    ms <- metric_summary[metric == input$metric_sel]
    datatable(ms[, .(Metric = short_name, `Sig. pairs` = n_sig,
                     `Total pairs` = n_total, `% Significant` = round(pct_sig, 1),
                     `Median |Cliff's d|` = round(median_cliff, 3),
                     `Mean |Cliff's d|` = round(mean_cliff, 3))],
              extensions = "Buttons",
              options = dt_download_opts(pageLength = 23),
              rownames = FALSE)
  })

  # ========================================================================
  # Tab 4: Pairwise Comparison
  # ========================================================================

  pw_data <- reactive({
    req(input$pw_tissue1, input$pw_tissue2)
    t1 <- input$pw_tissue1; t2 <- input$pw_tissue2
    pairwise_stats[(tissue1 == t1 & tissue2 == t2) |
                   (tissue1 == t2 & tissue2 == t1)]
  })

  output$pw_bar <- renderPlotly({
    req(input$pw_tissue1, input$pw_tissue2)
    t1 <- input$pw_tissue1; t2 <- input$pw_tissue2
    sub1 <- dat[tissue_detail == t1, lapply(.SD, median, na.rm = TRUE), .SDcols = METRICS]
    sub2 <- dat[tissue_detail == t2, lapply(.SD, median, na.rm = TRUE), .SDcols = METRICS]
    df <- data.frame(
      metric = METRIC_SHORT[METRICS],
      t1_med = as.numeric(sub1[1, ]),
      t2_med = as.numeric(sub2[1, ]),
      family = METRIC_FAMILY[METRICS],
      stringsAsFactors = FALSE
    )
    df$metric <- factor(df$metric, levels = METRIC_SHORT)

    plot_ly(df, x = ~metric) %>%
      add_bars(y = ~t1_med, name = abbrev_tissue(t1),
               marker = list(color = "#1f77b4")) %>%
      add_bars(y = ~t2_med, name = abbrev_tissue(t2),
               marker = list(color = "#ff7f0e")) %>%
      layout(barmode = "group",
             xaxis = list(title = "", tickangle = 45),
             yaxis = list(title = "Median reachability (Z-score)"),
             legend = list(title = list(text = "")))
  })

  output$pw_stats_table <- renderDT(server = FALSE, {
    pw <- pw_data()
    req(nrow(pw) > 0)
    pw[, short := METRIC_SHORT[metric]]
    pw[, family := METRIC_FAMILY[metric]]
    datatable(
      pw[, .(Metric = short, Family = family,
             `n1` = n1, `n2` = n2,
             `Median 1` = round(median1, 3), `Median 2` = round(median2, 3),
             `Cliff's d` = round(cliff_d, 3),
             `p-value` = signif(pval, 3), FDR = signif(fdr, 3))],
      extensions = "Buttons",
      options = dt_download_opts(pageLength = 23), rownames = FALSE
    )
  })

  output$pw_heatmap <- renderPlotly({
    req(input$pw_heatmap_metric)
    m <- input$pw_heatmap_metric
    sub <- pairwise_stats[metric == m]
    req(nrow(sub) > 0)

    tissues <- sort(unique(c(sub$tissue1, sub$tissue2)))
    tissues_short <- abbrev_tissue(tissues)
    mat <- matrix(0, nrow = length(tissues), ncol = length(tissues),
                  dimnames = list(tissues_short, tissues_short))
    for (i in seq_len(nrow(sub))) {
      r <- abbrev_tissue(sub$tissue1[i])
      cc <- abbrev_tissue(sub$tissue2[i])
      mat[r, cc] <- sub$signed_log10fdr[i]
      mat[cc, r] <- -sub$signed_log10fdr[i]
    }
    heatmaply(mat,
              colors = colorRampPalette(c("#2166AC", "white", "#B2182B"))(256),
              limits = c(-max(abs(mat)), max(abs(mat))),
              xlab = "", ylab = "",
              main = paste0(METRIC_SHORT[m], ": signed -log10(FDR)"),
              margins = c(120, 200, 40, 10),
              fontsize_row = 8, fontsize_col = 8,
              dendrogram = "both",
              key.title = "signed\n-log10(FDR)",
              plot_method = "plotly",
              height = max(700, nrow(mat) * 18))
  })

  # ========================================================================
  # Tab 5: Aging Analysis
  # ========================================================================

  output$aging_heatmap <- renderPlotly({
    wide <- dcast(aging_spearman, tissue ~ metric, value.var = "rho")
    mat <- as.data.frame(wide)
    rownames(mat) <- abbrev_tissue(mat$tissue)
    mat$tissue <- NULL
    # Reorder columns to METRICS order
    cols <- intersect(METRICS, colnames(mat))
    mat <- mat[, cols, drop = FALSE]
    colnames(mat) <- METRIC_SHORT[cols]
    heatmaply(as.matrix(mat),
              colors = colorRampPalette(c("#2166AC", "white", "#B2182B"))(256),
              limits = c(-0.3, 0.3),
              xlab = "Metric", ylab = "",
              main = "", margins = c(80, 200, 10, 10),
              fontsize_row = 9, fontsize_col = 9,
              dendrogram = "both",
              key.title = "Spearman ρ",
              plot_method = "plotly",
              height = max(700, nrow(mat) * 18))
  })

  output$aging_trajectory <- renderPlotly({
    req(input$aging_tissue, input$aging_metric)
    sub <- as.data.frame(aging_trajectory[tissue == input$aging_tissue &
                            metric == input$aging_metric])
    req(nrow(sub) > 0)
    age_order <- c("20-29", "30-39", "40-49", "50-59", "60-69", "70-79")
    sub$age <- factor(sub$age, levels = age_order)
    sub <- sub[order(sub$age), ]

    plot_ly(data = sub, x = ~age, y = ~median, type = "scatter",
            mode = "lines+markers",
            line = list(color = "#E65100", width = 2),
            marker = list(color = "#E65100", size = 8),
            error_y = list(type = "data", symmetric = FALSE,
                           array = sub$q75 - sub$median,
                           arrayminus = sub$median - sub$q25,
                           color = "rgba(230,81,0,0.4)", width = 4),
            text = ~paste0("n=", n),
            hoverinfo = "x+y+text") %>%
      layout(xaxis = list(title = "Age group",
                          categoryorder = "array",
                          categoryarray = age_order),
             yaxis = list(title = paste0(METRIC_SHORT[input$aging_metric],
                                        " (Z-score)")))
  })

  output$aging_summary_bar <- renderPlotly({
    summary_dt <- aging_spearman[, .(
      decline  = sum(direction == "decrease" & fdr < 0.05),
      increase = sum(direction == "increase" & fdr < 0.05)
    ), by = metric]
    n_tissues <- aging_spearman[, uniqueN(tissue)]
    summary_dt[, ns := n_tissues - decline - increase]
    summary_dt[, short := METRIC_SHORT[metric]]
    summary_dt[, short := factor(short, levels = METRIC_SHORT)]

    plot_ly(summary_dt, x = ~short) %>%
      add_bars(y = ~decline,  name = "Decline (FDR<0.05)",
               marker = list(color = "#2166AC")) %>%
      add_bars(y = ~ns,       name = "NS",
               marker = list(color = "#CCCCCC")) %>%
      add_bars(y = ~increase, name = "Increase (FDR<0.05)",
               marker = list(color = "#B2182B")) %>%
      layout(barmode = "stack",
             xaxis = list(title = "", tickangle = 45),
             yaxis = list(title = "Number of tissues"),
             legend = list(title = list(text = "")))
  })

  # ========================================================================
  # Tab 6: PCA
  # ========================================================================

  output$pca_biplot <- renderPlotly({
    req(input$pca_y)
    yvar <- input$pca_y
    pca_coords[, sys := system]
    plot_ly(pca_coords, x = ~PC1, y = as.formula(paste0("~", yvar)),
            color = ~sys, colors = TISSUE_SYS_COLS,
            type = "scatter", mode = "markers",
            text = ~tissue, hoverinfo = "text+x+y",
            marker = list(size = 10)) %>%
      layout(xaxis = list(title = "PC1"),
             yaxis = list(title = yvar),
             legend = list(title = list(text = "System")))
  })

  output$pca_loadings_table <- renderDT(server = FALSE, {
    load_df <- as.data.frame(pca_loadings)
    load_df$abs_PC1 <- abs(load_df$PC1)
    load_df <- load_df[order(-load_df$abs_PC1), ]
    load_df$PC1 <- round(load_df$PC1, 4)
    load_df$PC2 <- round(load_df$PC2, 4)
    load_df$PC3 <- round(load_df$PC3, 4)
    load_df$abs_PC1 <- round(load_df$abs_PC1, 4)
    datatable(load_df[1:min(50, nrow(load_df)),
                      c("gene", "category", "PC1", "PC2", "PC3", "abs_PC1")],
              extensions = "Buttons",
              options = dt_download_opts(pageLength = 15),
              rownames = FALSE, filter = "top")
  })

  # ========================================================================
  # Tab 7: Cascade Validation
  # ========================================================================

  output$cascade_bar <- renderPlotly({
    rs <- as.data.frame(receptor_stats)
    df <- data.frame(
      cascade = rep(rs$cascade, 2),
      type    = rep(c("Receptor", "Downstream"), each = nrow(rs)),
      rho     = c(rs$rho_rec, rs$rho_down),
      pval    = c(rs$pval_rec, rs$pval_down),
      family  = rep(rs$family, 2),
      stringsAsFactors = FALSE
    )
    df$label <- paste0("ρ=", round(df$rho, 3), "\np=", signif(df$pval, 2))
    plot_ly(df, x = ~cascade, y = ~rho, color = ~type,
            text = ~label, hoverinfo = "text",
            type = "bar") %>%
      layout(barmode = "group",
             xaxis = list(title = ""),
             yaxis = list(title = "Spearman ρ (tissue medians)"),
             legend = list(title = list(text = "")))
  })

  output$aggregation_bar <- renderPlotly({
    ag <- as.data.frame(aggregation_stats)
    ag$method_label <- factor(ag$method_label,
                              levels = unique(ag$method_label))
    plot_ly(ag, x = ~cascade, y = ~rho, color = ~method_label,
            type = "bar",
            text = ~paste0("ρ=", round(rho, 3)),
            hoverinfo = "text") %>%
      layout(barmode = "group",
             xaxis = list(title = ""),
             yaxis = list(title = "Spearman ρ"),
             legend = list(title = list(text = "Method")))
  })

  output$aggregation_table <- renderDT(server = FALSE, {
    ag <- as.data.frame(aggregation_stats)
    ag$rho <- round(ag$rho, 4)
    ag$p <- signif(ag$p, 3)
    ag$p_bh <- signif(ag$p_bh, 3)
    datatable(ag[, c("cascade", "method_label", "rho", "p", "p_bh", "n")],
              colnames = c("Cascade", "Method", "\u03c1", "p-value", "FDR", "n"),
              extensions = "Buttons",
              options = dt_download_opts(pageLength = 20),
              rownames = FALSE)
  })

  # ========================================================================
  # Tab 7 (continued): Exploratory Cascade Analysis
  # ========================================================================

  # Helper: compute Spearman correlation between a reachability metric and a gene
  compute_corr <- function(metric, gene) {
    reach_vals <- reach_tissue_median[common_tissues, metric]
    gene_vals  <- tissue_gene_mat[gene, common_tissues]
    if (all(is.na(gene_vals)) || sd(gene_vals, na.rm = TRUE) == 0) {
      return(data.frame(gene = gene, metric = metric, rho = NA,
                        pval = NA, n = length(common_tissues),
                        stringsAsFactors = FALSE))
    }
    ct <- cor.test(reach_vals, gene_vals, method = "spearman", exact = FALSE)
    data.frame(gene = gene, metric = metric, rho = ct$estimate,
               pval = ct$p.value, n = length(common_tissues),
               stringsAsFactors = FALSE)
  }

  # Reactive: selected gene correlations (button-triggered)
  explore_results <- reactiveVal(NULL)

  observeEvent(input$explore_go, {
    req(input$explore_metric, input$explore_genes)
    results <- do.call(rbind, lapply(input$explore_genes, function(g) {
      compute_corr(input$explore_metric, g)
    }))
    results <- results[order(-abs(results$rho)), ]
    explore_results(results)
  })

  # Screen: top correlated genes across all available genes
  observeEvent(input$screen_go, {
    req(input$explore_metric)
    m <- input$explore_metric
    reach_vals <- reach_tissue_median[common_tissues, m]
    n_top <- input$screen_top_n

    # Vectorised Spearman for speed
    gene_sub <- tissue_gene_mat[all_genes_available, common_tissues, drop = FALSE]
    rhos <- apply(gene_sub, 1, function(gv) {
      if (sd(gv, na.rm = TRUE) == 0) return(NA_real_)
      cor(reach_vals, gv, method = "spearman", use = "complete.obs")
    })

    # Top N by |rho|
    top_idx <- head(order(-abs(rhos)), n_top)
    top_genes <- names(rhos)[top_idx]

    results <- do.call(rbind, lapply(top_genes, function(g) {
      compute_corr(m, g)
    }))
    results <- results[order(-abs(results$rho)), ]

    # Update gene selector with top hits for further exploration
    updateSelectizeInput(session, "explore_genes",
                         selected = head(top_genes, 3))
    explore_results(results)
  })

  output$explore_scatter <- renderPlotly({
    res <- explore_results()
    req(res, nrow(res) > 0)
    m <- res$metric[1]
    genes_to_plot <- head(res$gene[!is.na(res$rho)], 4)
    req(length(genes_to_plot) > 0)

    reach_vals <- reach_tissue_median[common_tissues, m]
    sys <- tissue_system(common_tissues)

    plots <- list()
    for (g in genes_to_plot) {
      gene_vals <- tissue_gene_mat[g, common_tissues]
      r <- res[res$gene == g, ]
      df <- data.frame(reach = reach_vals, expr = gene_vals,
                       tissue = abbrev_tissue(common_tissues),
                       system = sys, stringsAsFactors = FALSE)
      p <- plot_ly(df, x = ~reach, y = ~expr,
                   color = ~system, colors = TISSUE_SYS_COLS,
                   type = "scatter", mode = "markers",
                   text = ~tissue, hoverinfo = "text+x+y",
                   marker = list(size = 8),
                   showlegend = (g == genes_to_plot[1])) %>%
        layout(
          xaxis = list(title = paste0(METRIC_SHORT[m], " (median)")),
          yaxis = list(title = paste0(g, " TPM (median)")),
          annotations = list(
            list(x = 0.5, y = 1.05, xref = "paper", yref = "paper",
                 text = sprintf("%s: \u03c1=%.3f, p=%.2e",
                                g, r$rho, r$pval),
                 showarrow = FALSE, font = list(size = 13))
          )
        )
      plots[[g]] <- p
    }

    if (length(plots) == 1) {
      plots[[1]]
    } else {
      subplot(plots, nrows = ceiling(length(plots) / 2),
              shareX = FALSE, shareY = FALSE, titleY = TRUE, titleX = TRUE,
              margin = 0.07)
    }
  })

  output$explore_corr_table <- renderDT(server = FALSE, {
    res <- explore_results()
    req(res)
    res$rho  <- round(res$rho, 4)
    res$pval <- signif(res$pval, 3)
    datatable(res,
              colnames = c("Gene", "Metric", "\u03c1", "p-value", "n tissues"),
              extensions = "Buttons",
              options = dt_download_opts(pageLength = 30),
              rownames = FALSE)
  })
}
