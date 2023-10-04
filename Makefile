.PHONY: help

SHELL:=/bin/bash
MAKEFILE_FULLPATH := $(abspath $(lastword $(MAKEFILE_LIST)))
MAKEFILE_DIR := $(dir $(MAKEFILE_FULLPATH))

target_title = @echo -e "🌱$(1)..."

define run  # Arguments: envrionment name, script path
	$(call target_title, "Running $(2) with envrionment=$(1)") \
	&& . ${MAKEFILE_DIR}/scripts/load_env.sh $(1) \
	&& ${MAKEFILE_DIR}/$(2)
endef

help: ## Show this help
	@echo
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%s\033[0m|%s\n", $$1, $$2}' \
        | column -t -s '|'
	@echo

deploy: build ## Deploy this app
	$(call target_title, "Deploying") \
	&& . ${MAKEFILE_DIR}/scripts/load_env.sh \
	&& ${MAKEFILE_DIR}/scripts/deploy.sh

build:  ## Build the docker image
	$(call target_title, "Building") \
	&& . ${MAKEFILE_DIR}/scripts/load_env.sh \
	&& ${MAKEFILE_DIR}/scripts/generate_ui_config.sh \
	&& ${MAKEFILE_DIR}/scripts/build.sh

run-app:
	$(call target_title, "Running UI Locally...") \
	&& ENVIRONMENT=dev . ${MAKEFILE_DIR}/scripts/load_env.sh \
	&& ${MAKEFILE_DIR}/scripts/generate_ui_config.sh \
	&& cd ${MAKEFILE_DIR}/ui && yarn start

run-api:
	$(call target_title, "Running API Locally...") \
	&& ENVIRONMENT=dev . ${MAKEFILE_DIR}/scripts/load_env.sh \
	&& cd ${MAKEFILE_DIR}/api && uvicorn main:app --reload
