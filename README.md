# Invoice.to

This repository is the source code of [invoice.to](https://invoice.to), an online service that helps you generate invoices, send them to your clients and receive payments. Contributions to this project are welcome.

## Installation

Invoice.to is built with PHP and MongoDB, so make sure you have those installed in your development environment. If your contribution requires testing mailing or payment systems, you will need to set up a [Mailgun](https://www.mailgun.com/) and a [Stripe](https://stripe.com/) account as well.

Assuming you have current versions of PHP and MongoDB in your system already, you need to clone the code and install dependencies. Invoice.to uses `composer` and `bower` for dependency management. 

If you don't have `composer` already, you can [follow this installation guide](https://getcomposer.org/doc/00-intro.md#installation-linux-unix-osx).

Javascript and CSS dependencies can be [installed using Bower](https://bower.io/#install-bower). It is not necessary to install JS and CSS dependencies in order to run the application, since the assets are compiled into minified assets as part of the development process.

```sh
$ git clone https://github.com/ukaner/invoice-to.git
$ cd invoice-to
$ composer install
```

Production keys of services that invoice.to uses are not in the code. Instead system receives them from environment variables.

You will need to set up environment variables listed below:

- `MONGODB_URI` that is used by mongodb driver to connect the DB. Example: `mongodb://127.0.0.1:27017`. If your database requires username and password, include them in the URI as well. Example: `mongodb://username:password@127.0.0.1:27017`.
- `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` are keys necessary for Stripe to work. You can get those API keys from your Stripe account. 
- `MAILGUN_KEY` and `MAILGUN_DOMAIN` are given to you when you set up a Mailgun account. It is free to send 10.000 mails every month so a free account should be enough to test your developments.

## Development

You can set up development environment for Invoice.to either using Apache, PHP and MongoDB installed on your machine, or using [Docker](https://www.docker.com/).

### Using Docker

Make sure you have [Docker](https://docs.docker.com/engine/installation/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

Set the environment variables in `docker-compose.yml` and run the containers: 

```sh
$ docker-compose up
```

### Using local Apache, PHP and MongoDB

Setting up local development environment requires you to install MongoDB. [This link](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/) explains how to do it in Mac OS X. If you already have Homebrew installed on your system you can simply type `brew install mongodb` on your terminal to have it installed. After that, MongoDB has to be started. MongoDB needs you to specify a folder to store its data. Tutorial suggests `/data/db` path. So basically you need to create that folder and type `sudo mongod --dbpath /data/db`.

Now you need to set up Apache. Mac OS X comes with `apachectl`. You can type `sudo apachectl start` on terminal to start running it. You need to configure virtual hosts. Add following code to `/etc/apache2/extra/httpd-vhosts.conf`.

```
<VirtualHost *:80>
    ServerAdmin john.doe@example.com
    DocumentRoot "<DIRECTORY_LOCATION>"
    ServerName invoice.to
    ServerAlias invoice.to

    SetEnv MONGODB_URI "127.0.0.1:27017/invoiceto"
    SetEnv STRIPE_SECRET_KEY "<your_stripe_secret_key>"
    SetEnv STRIPE_PUBLISHABLE_KEY "<your_stripe_publishable_key>"
    SetEnv MAILGUN_KEY "<your_mailgun_key>"
    SetEnv MAILGUN_DOMAIN "<your_mailgun_domain>"
    SetEnv PHP_ENV "development"

    <Directory "<DIRECTORY_LOCATION>">
         Order allow,deny
         Allow from all
         Require all granted
         AllowOverride All
    </Directory>
</VirtualHost>
```

Don't forget to replace `<DIRECTORY_LOCATION>` with the location of invoice.to directory in your system. For example `/srv/www/invoice-to`. Then open up `/etc/apache2/httpd.conf` in your favourite text editor. You will find following line:

`#LoadModule vhost_alias_module libexec/apache2/mod_vhost_alias.so`

Remove `#` letter at the beginning and save the file. Finally restart the Apache by typing `sudo apachectl restart`.

### Building assets

All assets can be compiled using `gulp`. Make sure you compile the assets every time you make a change to either JS or CSS files.

```sh
$ npm install
$ bower install
$ gulp
```

## Contributing

### Issue Contributions

Open an issue about anything you want to change in the product and let other contributors and the product owner discuss it. When opening new issues or commenting on existing issues on this repository please make sure discussions are related to concrete technical issues and/or ideas.

### Code Contributions

You may want to accompany your issue with implementation or provide implementation for an existing issue.

This document will guide you through the contribution process.

#### Step 1: Fork

Fork the project [on GitHub](https://github.com/ukaner/invoice-to) and check out your copy locally.

```sh
$ git clone https://github.com/<username>/invoice-to.git
$ cd invoice-to
$ git remote add upstream https://github.com/ukaner/invoice-to.git
```

##### Which branch?

For developing new features and bug fixes, the `master` branch should be pulled and built upon.

##### Dependencies

Invoice.to has several dependencies in the *css/* and the *js/* directories. Any changes to files in those directories should be sent to their respective projects.

#### Step 2: Branch

Create a branch and start hacking:

```sh
$ git checkout -b my-branch -t origin/master
```

#### Step 3: Commit

Make sure git knows your name and email address:

```sh
$ git config --global user.name "John Doe"
$ git config --global user.email "john.doe@example.com"
```

Writing good commit logs is important. A commit log should describe what changed and why. 

If your patch fixes an open issue, you can add a reference to it at the end
of the log. Use the `Fixes:` prefix and the full issue URL. For example:

```
Fixes: https://github.com/ukaner/invoice-to/issues/123
```

#### Step 4: Rebase

Use `git rebase` (not `git merge`) to sync your work from time to time.

```sh
$ git fetch upstream
$ git rebase upstream/master
```

#### Step 5: Push

```sh
$ git push origin my-branch
```

Go to `https://github.com/<username>/invoice-to` and select your branch. Click the `Pull Request` button and fill out the form.

Pull requests are usually reviewed within a few days. If there are comments to address, apply your changes in a separate commit and push that to your branch.
