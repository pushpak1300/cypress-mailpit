# Cypress Mailpit

[![npm version](https://badge.fury.io/js/cypress-mailpit.svg)](https://badge.fury.io/js/cypress-mailpit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![cypress-mailpit-og-image](/og-image.png)

This package provides a comprehensive set of Cypress commands designed specifically for interacting with [Mailpit](https://mailpit.axllent.org/), a popular mail testing tool.
This package supports TypeScript out of the box.

## Table of Contents
- [Features](#features)
- [Setup](#setup)
- [Commands Reference](#commands-reference)
  - Mail Management
    - [mailpitGetAllMails](#mailpitgetallmailsstart--0-limit--50)
    - [mailpitSearchEmails](#mailpitsearchemailsquery-start--0-limit--50)
    - [mailpitGetEmailsBySubject](#mailpitgetemailsbysubjectsubject-start--0-limit--50)
    - [mailpitGetEmailsByTo](#mailpitgetemailsbytomail-start--0-limit--50)
    - [mailpitGetMail](#mailpitgetmailid)
    - [mailpitSendMail](#mailpitsendmailoptions)
    - [mailpitDeleteAllEmails](#mailpitdeleteallmails)
    - [mailpitDeleteEmailsBySearch](#mailpitdeleteemailsbysearchquery-string)
  - Email Assertions
    - [mailpitHasEmailsBySearch](#mailpithasemailsbysearchquery-start--0-limit--50--timeout--10000-interval--500-)
    - [mailpitNotHasEmailsBySearch](#mailpitnothasemailsbysearchquery-start--0-limit--50--timeout--4000-interval--500-)
    - [mailpitHasEmailsBySubject](#mailpithasemailsbysubjectsubject-start--0-limit--50--timeout--4000-interval--500-)
    - [mailpitHasEmailsByTo](#mailpithasemailsbytomail-start--0-limit--50--timeout--4000-interval--500-)
    - [mailpitNotHasEmailsBySubject](#mailpitnothasemailsbysubjectsubject-start--0-limit--50--timeout--4000-interval--500-)
    - [mailpitNotHasEmailsByTo](#mailpitnothasemailsbytomail-start--0-limit--50--timeout--10000-interval--500-)
  - Single Mail Operations
    - [mailpitGetMailTextBody](#mailpitgetmailtextbodymessage)
    - [mailpitGetMailHTMLBody](#mailpitgetmailhtmlbodymessage)
    - [mailpitGetFromAddress](#mailpitgetfromaddressmessage)
    - [mailpitGetRecipientAddress](#mailpitgetrecipientaddressmessage)
    - [mailpitGetSubject](#mailpitgetsubjectmessage)
    - [mailpitGetAttachments](#mailpitgetattachmentsmessage)
    - [mailpitGetMailSpamAssassinSummary](#mailpitgetmailspamassassinsummarymessage)
  - Email Status Management
    - [mailpitSetAllEmailStatusAsRead](#mailpitsetallemailstatusasread)
    - [mailpitSetAllEmailStatusAsUnRead](#mailpitsetallemailstatusasunread)
    - [mailpitSetStatusAsRead](#mailpitsetstatusasreadmessages)
    - [mailpitSetStatusAsUnRead](#mailpitsetstatusasunreadmessages)

### Features

📨 **Email Management:** Get, search, send, and delete emails • Get emails by subject • Custom Mailpit URL support • TypeScript and Basic Auth integration

📝 **Email Content:** Access email body, subject, sender, recipients, and attachments • Spam Assassin summary analysis

📱 **Status Control:** Set email status (read/unread) for individual or all emails • Full status management capabilities

🚀 **Coming Soon:** More exciting features in development!


### Setup

Install this package:

```bash
# npm
npm install --save-dev cypress-mailpit

# yarn
yarn add --dev cypress-mailpit

# pnpm
pnpm add -D cypress-mailpit
```

Include this package into your Cypress command file:

```JavaScript
// cypress/support/commands
import 'cypress-mailpit';
```

Add the base URL of your Mailpit installation in the `expose` block of your `cypress.config.ts` / `cypress.config.js`:

```typescript
export default defineConfig({
  projectId: "****",
  expose: {
    MAILPIT_URL: "http://localhost:8025",
  },
});
```

### Mailpit authentication (Basic Auth)

Add `MAILPIT_USERNAME` and `MAILPIT_PASSWORD` in the `env` block of your Cypress config:

```typescript
export default defineConfig({
  env: {
    MAILPIT_USERNAME: "mailpit username",
    MAILPIT_PASSWORD: "mailpit password",
  },
});
```

### Migrating to v2

v2 requires **Cypress >= 15.10.0**. The main change is that `MAILPIT_URL` has moved from `env` to `expose` in your Cypress config:

```diff
 export default defineConfig({
+  expose: {
+    MAILPIT_URL: "http://localhost:8025",
+  },
   env: {
-    MAILPIT_URL: "http://localhost:8025",
     MAILPIT_USERNAME: "admin",
     MAILPIT_PASSWORD: "admin",
   },
 });
```

`Cypress.expose()` is a synchronous API for non-sensitive values, while `cy.env()` is used for sensitive credentials like passwords. No changes are needed to your test code — all `cy.mailpitXxx()` commands work the same as before.

## Commands


#### mailpitGetAllMails(start = 0, limit = 50)

Yields an array of all the mails stored in Mailpit starting from `start` index up to `limit`.

```JavaScript
cy.mailpitGetAllMails().then((result) => {
    expect(result).to.have.property('messages');
    expect(result.messages).to.have.length(numberOfEmails);
    expect(result.messages).to.be.an('array');
    expect(result).to.have.property('tags');
    expect(result).to.have.property('messages_count', numberOfEmails);
    expect(result).to.have.property('start');
    expect(result).to.have.property('total', numberOfEmails);
    expect(result).to.have.property('count', numberOfEmails);
    expect(result).to.have.property('unread');
});
```

#### mailpitSearchEmails(query, start = 0, limit = 50)

Searches all mails from Mailpit using the given query and yields an array of matching mails starting from `start` index up to `limit`.
For more information about the query syntax, refer to the [Mailpit documentation](https://mailpit.axllent.org/docs/usage/search-filters/).

```JavaScript
cy.mailpitSearchEmails('Test').then((result) => {
    expect(result).to.have.property('messages');
    expect(result.messages).to.have.length(numberOfEmails);
    expect(result.messages).to.be.an('array');
    expect(result.messages[0].Snippet).to.contain('Test');
    expect(result.messages).to.have.length(numberOfEmails);
    expect(result.messages).to.be.an('array');
    expect(result).to.have.property('messages_count', numberOfEmails);
    expect(result).to.have.property('total', 3);
    expect(result).to.have.property('count', numberOfEmails);
});
```

#### mailpitGetEmailsBySubject(subject, start = 0, limit = 50)

Fetches all mails from Mailpit with the given subject starting from `start` index up to `limit`.

```JavaScript
cy.mailpitGetEmailsBySubject('My Test').then((result) => {
    expect(result).to.have.property('messages');
    expect(result.messages).to.have.length(numberOfEmails);
    expect(result.messages).to.be.an('array');
    expect(result).to.have.property('messages_count', numberOfEmails);
    expect(result).to.have.property('total', 2 * numberOfEmails);
    expect(result).to.have.property('count', numberOfEmails);
});
```

#### mailpitGetMail(id?)

Yields the mail with the given ID. If no ID is provided, yields the latest email.

```JavaScript
cy.mailpitGetMail().then((result) => {
    expect(result).to.have.property('ID');
    expect(result).to.have.property('MessageID');
    expect(result).to.have.property('From');
    expect(result).to.have.property('To');
    expect(result).to.have.property('Subject');
});
```

#### mailpitSendMail(options?)

Sends an email with the given options. If no options are provided, sends a default email.

```JavaScript
cy
  .mailpitSendMail({ to: [{ Email: 'recipient@example.com' }], subject: 'Hello', text: 'Test message' })
  .should('have.property', 'ID');
```

#### mailpitGetEmailsByTo(email, start = 0, limit = 50)

Fetches all emails from Mailpit sent to the given email address. Yields an array of matching emails.
```JavaScript

cy.mailpitGetEmailsBySubject('recipient@example.com').then((result) => {
    expect(result).to.have.property('messages');
    expect(result.messages).to.have.length(numberOfEmails);
    expect(result.messages).to.be.an('array');
    expect(result).to.have.property('messages_count', numberOfEmails);
    expect(result).to.have.property('total', 2 * numberOfEmails);
    expect(result).to.have.property('count', numberOfEmails);
});
```

#### mailpitHasEmailsBySearch(query, start = 0, limit = 50, { timeout = 10000, interval = 500 })

Checks if there are any emails in Mailpit with the given query.
Automatically retries until the condition is met or timeout is reached.

```JavaScript
cy.mailpitHasEmailsBySearch('subject:My Test');
```


#### mailpitNotHasEmailsBySearch(query, start = 0, limit = 50, { timeout = 4000, interval = 500 })

Checks if there are any emails in Mailpit with the given search query.
Automatically retries until the condition is met or timeout is reached.

```JavaScript
cy.mailpitNotHasEmailsBySearch('Subject:My Test');
```

#### mailpitHasEmailsBySubject(subject, start = 0, limit = 50, { timeout = 4000, interval = 500 })

Checks if there are any emails in Mailpit with the given subject.
Automatically retries until the condition is met or timeout is reached.

```JavaScript
cy.mailpitHasEmailsBySubject('My Test');
```

### mailpitHasEmailsByTo(email, start = 0, limit = 50, { timeout = 4000, interval = 500 })
Checks if there are no emails in Mailpit sent to the given email address.
Automatically retries until the condition is met or timeout is reached.

```JavaScript
cy.mailpitHasEmailsByTo('recipient@example.com', 0, 50, { timeout: 10000, interval: 500 });
```

### mailpitNotHasEmailsBySubject(subject, start = 0, limit = 50, { timeout = 4000, interval = 500 })
Checks if there are no emails in Mailpit with the given subject. 
Automatically retries until the condition is met or timeout is reached.

```JavaScript
cy.mailpitNotHasEmailsBySubject('My Test');
```


### mailpitNotHasEmailsByTo(email, start = 0, limit = 50, { timeout = 10000, interval = 500 })
Checks if there are any emails in Mailpit sent to the given email address. 
If no emails are found, the command will retry until the timeout is reached.

```JavaScript
cy.mailpitNotHasEmailsByTo('recipient@example.com');
```
## Default Values

In the `MailpitCommands` module, the following default values are used:

- **Timeout**: The default value for `timeout` is determined by the `Cypress.config("defaultCommandTimeout")`. If not specified in the options, it will fallback to this configuration.
- **Interval**: The default value for `interval` is set to `500` milliseconds if not provided in the options.

#### mailpitDeleteAllEmails()

Deletes all stored mails from Mailpit.

```JavaScript
cy.mailpitDeleteAllEmails();
```

#### mailpitDeleteEmailsBySearch(query: string)

Deletes emails from the mailbox based on the search query.

```JavaScript
cy.mailpitDeleteEmailsBySearch('subject:Test');
```


### Handling a Single Mail

#### mailpitGetMailTextBody(message?)

Yields the text body of the current mail.

```JavaScript
cy
  .mailpitGetMail()
  .mailpitGetMailTextBody()
  .should('contain', 'Message Body');
```

#### mailpitGetMailHTMlBody(message?)

Yields the HTML body of the current mail.

```JavaScript
cy
  .mailpitGetMail()
  .mailpitGetMailHTMlBody()
  .should('contain', '<p>Message Body</p>');
```

#### mailpitGetFromAddress(message?)

Yields the sender address of the current mail.

```JavaScript
cy
  .mailpitGetMail()
  .mailpitGetFromAddress()
  .should('eq', 'sender@example.com');
```

#### mailpitGetRecipientAddress(message?)

Yields the recipient addresses of the current mail.

```JavaScript
cy
  .mailpitGetMail()
  .mailpitGetRecipientAddress()
  .should('contain', 'recipient@example.com');
```

#### mailpitGetSubject(message?)

Yields the subject of the current mail.

```JavaScript
cy
  .mailpitGetMail()
  .mailpitGetSubject()
  .should('eq', 'My Subject');
```

#### mailpitGetAttachments(message?)

Yields the list of all filenames of the attachments of the current mail.

```JavaScript
cy
  .mailpitGetMail()
  .mailpitGetAttachments()
  .should('have.length', 2)
  .should('include', 'sample.pdf');
```

#### mailpitGetMailSpamAssassinSummary(message?)

Yields the SpamAssassin summary of the current mail.

```JavaScript
cy
  .mailpitGetMail()
  .mailpitGetMailSpamAssainSummary()
  .should('have.property', 'score');
```

#### mailpitSetAllEmailStatusAsRead()

Sets the status of all emails in Mailpit to 'read'.

```JavaScript
cy.mailpitSetAllEmailStatusAsRead();
```

#### mailpitSetAllEmailStatusAsUnRead()

Sets the status of all emails in Mailpit to 'unread'.

```JavaScript
cy.mailpitSetAllEmailStatusAsUnRead();
```

#### mailpitSetStatusAsRead(messages)

Sets the status of specified email(s) to 'read'. Can accept a single message or an array of messages.

```JavaScript
cy.mailpitGetMail().mailpitSetStatusAsRead();
```

#### mailpitSetStatusAsUnRead(messages)

Sets the status of specified email(s) to 'unread'. Can accept a single message or an array of messages.

```JavaScript
cy.mailpitGetMail().mailpitSetStatusAsUnRead();
```

## Package Development

Make sure the mailpit server is running. and set the env in `cypress.config.ts`

Install dependencies.

```bash
npm install
```

Build the package
```bash
npm run build
```

Run cypress tests
```bash
npm run cy:run
```

