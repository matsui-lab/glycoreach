#' Load glycan pathway definitions
#'
#' Loads the bundled JSON file containing pathway definitions for all five
#' glycan families, or a user-supplied JSON file.
#'
#' @param path Path to a pathway definitions JSON file. If NULL (default),
#'   the bundled definitions are used.
#' @return A list containing pathway definitions with AND/OR logic,
#'   gene lists, and donor substrate dependencies.
#' @export
#' @importFrom jsonlite fromJSON
#' @examples
#' defs <- load_pathway_definitions()
#' names(defs$pathways)
load_pathway_definitions <- function(path = NULL) {
  if (is.null(path)) {
    path <- system.file("extdata", "pathway_definitions.json",
                        package = "glycoreach", mustWork = TRUE)
  }
  jsonlite::fromJSON(path, simplifyVector = FALSE)
}
