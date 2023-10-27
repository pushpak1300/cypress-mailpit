# cypress-mailpit

A collection of useful Cypress commands for mailpit 🐗.

This package supports TypeScript out of the box. 

### Setup

Install this package via NPM:

```bash
npm install cypress-mailpit
```

Include this package into your Cypress command file:

```JavaScript
// cypress/support/commands
import 'cypress-mailpit';
```

###### Before cypress 10.0.0

Add the base url of your mailpit installation to your `cypress.json`:

```json
{
  ...
  "mailpitUrl": "http://localhost:8090"
}
```

###### After cypress 10.0.0

Add the base url of your mailpit installation in the `e2e` block of your `cypress.config.ts` / `cypress.config.js`:

```typescript
export default defineConfig({
    projectId: "****",
    env: { 
        mailpitUrl: "http://localhost:8090/",
    }
})
```

If your mailpit instance uses authentication, add `mailpitAuth` to your cypress `env` config:

```json
{
  ...
  "mailpitAuth": {"user": "mailpit username", "pass": "mailpit password"}
}
```

or add `mailpitUsername` and `mailpitPassword` in cypress env config

```json
{
  ...
  "mailpitUsername": "mailpit username",
  "mailpitPassword": "mailpit password"
}
```

## Commands
### Mail Collection
#### mhGetAllMails( limit=50, options={timeout=defaultCommandTimeout} ) 

Yields an array of all the mails stored in mailpit. This retries automatically until mails are found (or until timeout is reached). 

```JavaScript
cy
  .mhGetAllMails()
  .should('have.length', 1);
```

#### mhGetMailsBySubject( subject, limit=50, options={timeout=defaultCommandTimeout} ) 

Yields an array of all mails with given subject. This retries automatically until mails are found (or until timeout is reached).

```JavaScript
cy
  .mhGetMailsBySubject('My Subject')
  .should('have.length', 1);
```
#### mhGetMailsBySender( from, limit=50, options={timeout=defaultCommandTimeout} ) 

Yields an array of all mails with given sender. This retries automatically until mails are found (or until timeout is reached).

```JavaScript
cy
  .mhGetMailsBySender('sender@example.com')
  .should('have.length', 1);
```
#### mhGetMailsByRecipient( recipient, limit=50 ) 

Yields an array of all mails with given recipient.

```JavaScript
cy
  .mhGetMailsByRecipient('recipient@example.com')
  .should('have.length', 1);
```
#### mhFirst()

Yields the first mail of the loaded selection.

```JavaScript
cy
  .mhGetAllMails()
  .should('have.length', 1)
  .mhFirst();
``` 
#### mhDeleteAll()

Deletes all stored mails from mailpit.

```JavaScript
cy.mhDeleteAll();
``` 


### Handling a Single Mail ✉️
#### mhGetSubject()

Yields the subject of the current mail.

```JavaScript
cy
  .mhGetAllMails()
  .should('have.length', 1)  
  .mhFirst()
  .mhGetSubject()
  .should('eq', 'My Mails Subject');
``` 
#### mhGetBody()

Yields the body of the current mail.

```JavaScript
cy
  .mhGetAllMails()
  .should('have.length', 1)
  .mhFirst()
  .mhGetBody()
  .should('contain', 'Part of the Message Body');
``` 
#### mhGetSender()

Yields the sender of the current mail.

```JavaScript
cy
  .mhGetAllMails()
  .should('have.length', 1)
  .mhFirst()
  .mhGetSender()
  .should('eq', 'sender@example.com');
``` 
#### mhGetRecipients()

Yields the recipient of the current mail.

```JavaScript
cy
  .mhGetAllMails()
  .should('have.length', 1)
  .mhFirst()
  .mhGetRecipients()
  .should('contain', 'recipient@example.com');
``` 


### Asserting the Mail Collection 🔍

#### mhHasMailWithSubject( subject )

Asserts if there is a mail with given subject.

```JavaScript
cy.mhHasMailWithSubject('My Subject');
``` 
#### mhHasMailFrom( from )

Asserts if there is a mail from given sender.

```JavaScript
cy.mhHasMailFrom('sender@example.com');
``` 
#### mhHasMailTo( recipient )

Asserts if there is a mail to given recipient (looks for "To", "CC" and "BCC").

```JavaScript
cy.mhHasMailTo('recipient@example.com');
``` 

## Package Development

### Start Local Test Server

Navigate into the `test-server` directory.

```bash
cd ./test-server/
```

Install dependencies.

```bash
composer install
yarn # or npm install
```

Start docker server.

```bash
docker-compose up
```

Open the test page in your browser: [http://localhost:3000/cypress-mh-tests/](http://localhost:3000/cypress-mh-tests/)

Open mailpit in your browser: [http://localhost:8090/](http://localhost:8090/)

Open the Cypress testclient.

```bash
yarn cypress:open
```
