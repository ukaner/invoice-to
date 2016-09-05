This repository is the source code of [invoice.to](https://invoice.to), an online service that helps you generate invoice, send them to your clients and receive payments. Contributions to this project are welcome.

# Installation

Invoice.to is built with PHP and MongoDB, so make sure you have those installed in your development environment. If your contribution requires testing mailing or payment systems, you will need to set up a Mailgun and a Stripe account as well.

Assuming you have PHP and MongoDB in your system already, you need to clone the code and install dependencies. Invoice.to uses `composer` for dependency management. If you don't have `composer` already, you can [follow this installation guide](https://getcomposer.org/doc/00-intro.md#installation-linux-unix-osx). If you already have `composer`, let's continue.

```sh
git clone git@github.com:ukaner/invoice-to.git
cd invoice-to
composer install
```

Production keys of services that invoice.to uses are not in the code. Instead system receives them from environment variables.

You will need to set up environment variables below:

- `MONGODB_URI` that is used by mongodb driver to connect the DB. Example: `mongodb://127.0.0.1:27017`. If your database requires username and password, include them in the URI as well. Example: `mongodb://username:password@127.0.0.1:27017`.
- `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` are keys necessary for Stripe to work. You can get those API keys from your Stripe account. 
- `MAILGUN_KEY` and `MAILGUN_DOMAIN` are given to you when you set up a Mailgun account. It is free to send 10.000 mails every month so a free account should be enough to test your developments.

# Contribution
Open an issue about the things you want to change in the product and let other people and product owner discuss it first. Once it is approved, create a separate branch from `master` and make your changes there. After you make your final commit, send us a `pull request` so that we can review your changes. We will merge it to `master` and send it to our production server and your contributions will be live on [invoice.to](https://invoice.to).
