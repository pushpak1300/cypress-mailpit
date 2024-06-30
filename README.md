# Cypress Mailpit

[![npm version](https://badge.fury.io/js/cypress-mailpit.svg)](https://badge.fury.io/js/cypress-mailpit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![cypress-mailpit-og-image](/og-image.png)

This package provides a comprehensive set of Cypress commands designed specifically for interacting with [Mailpit](https://mailpit.axllent.org/), a popular mail testing tool.
This package supports TypeScript out of the box.

### Features
- [x] Get all mails from Mailpit
- [x] Search mails from Mailpit
- [x] Get mails by subject
- [x] Get a single mail from Mailpit
- [x] Send a mail from Mailpit
- [x] Delete all mails from Mailpit
- [x] Get the subject of a mail
- [x] Get the body of a mail
- [x] Get the sender of a mail
- [x] Get the recipients of a mail
- [x] Get the attachments of a mail
- [x] Get the spam assassin summary of a mail
- [x] TypeScript support
- [x] Basic Auth support
- [x] Custom Mailpit URL
- [ ] Many more to come

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

Add the base URL of your Mailpit installation in the `e2e` block of your `cypress.config.ts` / `cypress.config.js`:

```typescript
export default defineConfig({
  projectId: "****",
  env: {
    MAILPIT_URL: "http://localhost:8025/",
  },
});
```

### Mailpit authentication (Basic Auth)

Add `MAILPIT_USERNAME` and `MAILPIT_PASSWORD` in Cypress env config:

```json
{
  "MAILPIT_USERNAME": "mailpit username",
  "MAILPIT_PASSWORD": "mailpit password"
}
```

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
  .mailpitSendMail({ to: 'recipient@example.com', subject: 'Hello', text: 'Test message' })
  .should('have.property', 'ID');
```

#### mailpitDeleteAllEmails()

Deletes all stored mails from Mailpit.

```JavaScript
cy.mailpitDeleteAllEmails();
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

#### mailpitGetMailSpamAssainSummary(message?)

Yields the SpamAssassin summary of the current mail.

```JavaScript
cy
  .mailpitGetMail()
  .mailpitGetMailSpamAssainSummary()
  .should('have.property', 'score');
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
