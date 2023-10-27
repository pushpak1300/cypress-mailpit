const mhApiUrl = (path) => {
  const envValue = Cypress.env('mailpitUrl');
  const basePath = envValue ? envValue : Cypress.config('mailpitUrl');
  return `${basePath}/api${path}`;
};

let mhAuth = Cypress.env('mailpitAuth') || '';
if (Cypress.env('mailpitUsername') && Cypress.env('mailpitPassword')) {
  mhAuth = {
    'user': Cypress.env('mailpitUsername'),
    'pass': Cypress.env('mailpitPassword'),
  };
}


const messages = (limit) => {
    return cy
        .request({
            method: 'GET',
            url: mhApiUrl(`/v1/messages?limit=${limit}`),
            auth: mhAuth,
            log: false,
        })
        .then((response) => {
            if (typeof response.body === 'string') {
              return JSON.parse(response.body.messages);
            } else {
              return response.body.messages;
            }
        })
        .then((parsed) => parsed.items);
};

const retryFetchMessages = (filter, limit, options = {}) => {
    const timeout =
        options.timeout || Cypress.config('defaultCommandTimeout') || 4000;
    let timedout = false;

    setTimeout(() => {
        timedout = true;
    }, timeout);

    const filteredMessages = (limit) => messages(limit).then(filter);

    const resolve = () => {
        if (timedout) {
            return filteredMessages(limit);
        }
        return filteredMessages(limit).then((messages) => {
            return cy.verifyUpcomingAssertions(messages, options, {
                onRetry: resolve,
            });
        });
    };

    return resolve();
};

/**
 * Mail Collection
 */
Cypress.Commands.add('mhDeleteAll', () => {
  return cy.request({
    method: 'DELETE',
    url: mhApiUrl('/v1/messages'),
    auth: mhAuth,
  });
});

Cypress.Commands.add('mhGetAllMails', (limit=50, options={}) => {
    const filter = (mails) => mails;

    return retryFetchMessages(filter, limit, options);
});

Cypress.Commands.add('mhFirst', {prevSubject: true}, (mails) => {
  return Array.isArray(mails) && mails.length > 0 ? mails[0] : mails;
});

Cypress.Commands.add('mhGetMailsBySubject', (subject, limit=50, options={}) => {
    const filter = (mails) =>
      mails.filter((mail) => mail.Subject === subject);

    return retryFetchMessages(filter, limit, options);
});

Cypress.Commands.add(
    'mhGetMailsByRecipient',
    (recipient, limit=50, options={}) => {
    const filter = (mails) => {
        return mails.filter((mail) =>
            mail.To.map((recipientObj) =>
              recipientObj.Address
            ).includes(recipient));
    };

    return retryFetchMessages(filter, limit, options);
});

Cypress.Commands.add('mhGetMailsBySender', (from, limit=50, options={}) => {
    const filter = (mails) =>
      mails.filter((mail) => mail.From.Address === from);

    return retryFetchMessages(filter, limit, options);
});

/**
 * Single Mail Commands and Assertions
 */
Cypress.Commands.add('mhGetSubject', {prevSubject: true}, (mail) => {
  return cy.wrap(mail).its('Subject');
});

Cypress.Commands.add('mhGetBody', {prevSubject: true}, (mail) => {
  return cy.wrap(mail).its('Snippet');
});

Cypress.Commands.add('mhGetSender', {prevSubject: true}, (mail) => {
  return cy.wrap(mail.From).its('Address');
});

Cypress.Commands.add('mhGetRecipients', {prevSubject: true}, (mail) => {
  return cy
    .wrap(mail)
    .then((mail) =>
      mail.To.map(
        (recipientObj) => recipientObj.Address
      )
    );
});

/**
 * Mail Collection Assertions
 */
Cypress.Commands.add('mhHasMailWithSubject', (subject) => {
  cy.mhGetMailsBySubject(subject).should('not.have.length', 0);
});

Cypress.Commands.add('mhHasMailFrom', (from) => {
  cy.mhGetMailsBySender(from).should('not.have.length', 0);
});

Cypress.Commands.add('mhHasMailTo', (recipient) => {
  cy.mhGetMailsByRecipient(recipient).should('not.have.length', 0);
});
