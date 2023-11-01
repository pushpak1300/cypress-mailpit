// Types for Message and Options
interface Recipient {
  Address: string;
  Name: string;
}

interface Message {
  Attachments: number;
  Bcc: Recipient[];
  Cc: Recipient[];
  Created: string;
  From: Recipient;
  ID: string;
  MessageID: string;
  Read: boolean;
  Size: number;
  Snippet: string;
  Subject: string;
  Tags: string[];
  To: Recipient[];
}

interface MessageApiResponse {
  messages: Message[];
  messages_count: number;
  start: number;
  tags: string[];
  total: number;
  unread: number;
}

interface RequestOptions {
  timeout?: number;
}

type AuthType = { user: string, pass: string } | undefined;

// Constants and Utility Functions
const mhApiUrl = (path:string) => {
  const envValue = Cypress.env('mailpitUrl');
  // @ts-ignore
  const basePath = envValue ? envValue : Cypress.config('mailpitUrl');
  return `${basePath}/api${path}`;
};

let mhAuth: AuthType = Cypress.env('mailHogAuth');
if (Cypress.env('mailHogUsername') && Cypress.env('mailHogPassword')) {
  mhAuth = {
    'user': Cypress.env('mailHogUsername'),
    'pass': Cypress.env('mailHogPassword'),
  };
}


const fetchMessages = (limit: number): Cypress.Chainable<MessageApiResponse> => {
  return cy.request({
    method: 'GET',
    url: mhApiUrl(`/v1/messages?limit=${limit}`),
    auth: mhAuth,
  })
  .then((response) => {
    if (typeof response.body === 'string') {
      return JSON.parse(response.body);
    } else {
      return response.body;
    }
  })
  .then((parsed) => parsed.items);
};

const retryFetchMessages = (filter: (mails: Message[]) => Message[], limit: number, options: RequestOptions = {}): Cypress.Chainable<Message[]> => {
  const defaultTimeout = Cypress.config('defaultCommandTimeout') || 4000;
  const timeout = options.timeout || defaultTimeout;
  let timedout = false;
  setTimeout(() => {
    timedout = true;
  }, timeout);

  const fetchAndFilter = (): Cypress.Chainable<Message[]> => {
    return fetchMessages(limit)
    .then(response => filter(response.messages))
    .then(filteredMails => cy.wrap(filteredMails) as Cypress.Chainable<Message[]>);
  };

  const resolve = (): Cypress.Chainable<Message[]> => {
    if (timedout) {
      return fetchAndFilter();
    }

    return fetchAndFilter()
    .then(messages => {
      // @ts-ignore
      return cy.verifyUpcomingAssertions(messages, options, { onRetry: resolve });
    });
  };

  return resolve();
};

Cypress.Commands.add('mhDeleteAll', () => cy.request({ method: 'DELETE', url: mhApiUrl('/v1/messages'), auth: mhAuth }));
Cypress.Commands.add('mhGetAllMails', (limit = 50, options: RequestOptions = {}) => retryFetchMessages(mails => mails, limit, options));
Cypress.Commands.add('mhFirst',{ prevSubject: true }, (mails: Message[]): Cypress.Chainable<Message> => {
  return cy.wrap(mails[0]);
});
Cypress.Commands.add('mhGetMailsBySubject', (subject: string, limit = 50, options: RequestOptions = {}) => retryFetchMessages(mails => mails.filter(mail => mail.Subject === subject), limit, options));
Cypress.Commands.add('mhGetMailsByRecipient', (recipient: string, limit = 50, options: RequestOptions = {}) => retryFetchMessages(mails => mails.filter(mail => mail.To.some(recipientObj => recipientObj.Address === recipient)), limit, options));
Cypress.Commands.add('mhGetMailsBySender', (from: string, limit = 50, options: RequestOptions = {}) => retryFetchMessages(mails => mails.filter(mail => mail.From.Address === from), limit, options));
Cypress.Commands.add('mhGetSubject', { prevSubject: true }, (mail: Message) => cy.wrap(mail).its('Subject'));
Cypress.Commands.add('mhGetBody', { prevSubject: true }, (mail: Message) => cy.wrap(mail).its('Snippet'));
Cypress.Commands.add('mhGetSender', { prevSubject: true }, (mail: Message) => cy.wrap(mail.From).its('Address'));
Cypress.Commands.add('mhGetRecipients', { prevSubject: true }, (mail: Message) => cy.wrap(mail.To.map(recipientObj => recipientObj.Address)));
Cypress.Commands.add('mhHasMailWithSubject', (subject: string) => cy.mhGetMailsBySubject(subject).should('not.have.length', 0));
Cypress.Commands.add('mhHasMailFrom', (from: string) => cy.mhGetMailsBySender(from).should('not.have.length', 0));
Cypress.Commands.add('mhHasMailTo', (recipient: string) => cy.mhGetMailsByRecipient(recipient).should('not.have.length', 0));
