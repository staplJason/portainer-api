<!-- start branding -->

<img src="https://raw.githubusercontent.com/feathericons/feather/main/icons/layers.svg" width="15%" align="center" alt="branding<icon:layers color:green>" />
<!-- end branding -->
<!-- start title -->

# undefinedportainer-api

<!-- end title -->
<!-- start badges -->

<!-- end badges -->

[![GitHub Super-Linter](https://github.com/actions/javascript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/javascript-action/actions/workflows/ci.yml/badge.svg)
![Coverage](./badges/coverage.svg)

<!-- start description -->

Github Action to work with the Portainer API

<!-- end description -->
<!-- start contents -->
<!-- end contents -->
<!-- start inputs -->

| **<b>Input</b>**                       | **<b>Description</b>**                                         | **<b>Default</b>** | **<b>Required</b>** |
| -------------------------------------- | -------------------------------------------------------------- | ------------------ | ------------------- |
| <b><code>portainer-url</code></b>      | URL of the portainer API.                                      |                    | **true**            |
| <b><code>portainer-username</code></b> | Username to authenticate against the API.                      |                    | **true**            |
| <b><code>portainer-password</code></b> | Password to authenticate against the API.                      |                    | **true**            |
| <b><code>portainer-endpoint</code></b> | Portainer Endpoint Name.                                       | <code>local</code> | **false**           |
| <b><code>stack-name</code></b>         | Stack name                                                     |                    | **true**            |
| <b><code>stack-file</code></b>         | Location of the stack file (Relative from the root directory). |                    | **true**            |
| <b><code>stack-env</code></b>          | Environment injected into Stack (JSON Format).                 | <code>{}</code>    | **false**           |
| <b><code>delete</code></b>             | Option to delete a stack if exists before create.              |                    | **false**           |
| <b><code>prune</code></b>              | Remove missing/obsolete services from stack on update.         |                    | **false**           |

<!-- end inputs -->
<!-- start outputs -->
<!-- end outputs -->
<!-- start usage -->

```yaml
- uses: staplJason/portainer-api@v0.0.0
  with:
    # Description: URL of the portainer API.
    #
    portainer-url: ""

    # Description: Username to authenticate against the API.
    #
    portainer-username: ""

    # Description: Password to authenticate against the API.
    #
    portainer-password: ""

    # Description: Portainer Endpoint Name.
    #
    # Default: local
    portainer-endpoint: ""

    # Description: Stack name
    #
    stack-name: ""

    # Description: Location of the stack file (Relative from the root directory).
    #
    stack-file: ""

    # Description: Environment injected into Stack (JSON Format).
    #
    # Default: {}
    stack-env: ""

    # Description: Option to delete a stack if exists before create.
    #
    # Default:
    delete: ""

    # Description: Remove missing/obsolete services from stack on update.
    #
    # Default:
    prune: ""
```

<!-- end usage -->
