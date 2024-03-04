# digitisingPTA Documentation

This is the site that hosts the project's documentation.

For full documentation on the chosen documentation toolkit, visit [mkdocs.org](https://www.mkdocs.org).

## Commands
Use these in your terminal.

* `mkdocs new [dir-name]` - Create a new project.
* `mkdocs serve` - Start the live-reloading docs server.
* `mkdocs build` - Build the documentation site.
* `mkdocs -h` - Print help message and exit.

## Documentation layout
This is how the digitisingPTA folder is set out in the repository:

    mkdocs.yml              # The configuration file.
    docs/
        about.md            # About the repository and the project
        getting_started.md  # How to set up the repository
        index.md            # The documentation homepage.
        ...                 # Other markdown pages, images and other files.
        stylesheets/
            extra.css       # Additional styling

## Documentation File Setup
If you would like to create a new tab at the top of the documentation site, please create a new .md file in the docs folder.

If you would like to rather creating sections within the same tab of documentation, use one single hash (#) followed by the title, or 2 hashes (##) followed by the subheading.

