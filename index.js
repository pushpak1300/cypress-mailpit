"use strict";
// Constants and Utility Functions
var mhApiUrl = function (path) {
    var envValue = Cypress.env('mailpitUrl');
    // @ts-ignore
    var basePath = envValue ? envValue : Cypress.config('mailpitUrl');
    return "".concat(basePath, "/api").concat(path);
};
var mhAuth = Cypress.env('mailHogAuth');
if (Cypress.env('mailHogUsername') && Cypress.env('mailHogPassword')) {
    mhAuth = {
        'user': Cypress.env('mailHogUsername'),
        'pass': Cypress.env('mailHogPassword'),
    };
}
var fetchMessages = function (limit) {
    return cy.request({
        method: 'GET',
        url: mhApiUrl("/v1/messages?limit=".concat(limit)),
        auth: mhAuth,
    })
        .then(function (response) {
        if (typeof response.body === 'string') {
            return JSON.parse(response.body);
        }
        else {
            return response.body;
        }
    })
        .then(function (parsed) { return parsed.items; });
};
var retryFetchMessages = function (filter, limit, options) {
    if (options === void 0) { options = {}; }
    var defaultTimeout = Cypress.config('defaultCommandTimeout') || 4000;
    var timeout = options.timeout || defaultTimeout;
    var timedout = false;
    setTimeout(function () {
        timedout = true;
    }, timeout);
    var fetchAndFilter = function () {
        return fetchMessages(limit)
            .then(function (response) { return filter(response.messages); })
            .then(function (filteredMails) { return cy.wrap(filteredMails); });
    };
    var resolve = function () {
        if (timedout) {
            return fetchAndFilter();
        }
        return fetchAndFilter()
            .then(function (messages) {
            // @ts-ignore
            return cy.verifyUpcomingAssertions(messages, options, { onRetry: resolve });
        });
    };
    return resolve();
};
Cypress.Commands.add('mhDeleteAll', function () { return cy.request({ method: 'DELETE', url: mhApiUrl('/v1/messages'), auth: mhAuth }); });
Cypress.Commands.add('mhGetAllMails', function (limit, options) {
    if (limit === void 0) { limit = 50; }
    if (options === void 0) { options = {}; }
    return retryFetchMessages(function (mails) { return mails; }, limit, options);
});
Cypress.Commands.add('mhFirst', { prevSubject: true }, function (mails) {
    return cy.wrap(mails[0]);
});
Cypress.Commands.add('mhGetMailsBySubject', function (subject, limit, options) {
    if (limit === void 0) { limit = 50; }
    if (options === void 0) { options = {}; }
    return retryFetchMessages(function (mails) { return mails.filter(function (mail) { return mail.Subject === subject; }); }, limit, options);
});
Cypress.Commands.add('mhGetMailsByRecipient', function (recipient, limit, options) {
    if (limit === void 0) { limit = 50; }
    if (options === void 0) { options = {}; }
    return retryFetchMessages(function (mails) { return mails.filter(function (mail) { return mail.To.some(function (recipientObj) { return recipientObj.Address === recipient; }); }); }, limit, options);
});
Cypress.Commands.add('mhGetMailsBySender', function (from, limit, options) {
    if (limit === void 0) { limit = 50; }
    if (options === void 0) { options = {}; }
    return retryFetchMessages(function (mails) { return mails.filter(function (mail) { return mail.From.Address === from; }); }, limit, options);
});
Cypress.Commands.add('mhGetSubject', { prevSubject: true }, function (mail) { return cy.wrap(mail).its('Subject'); });
Cypress.Commands.add('mhGetBody', { prevSubject: true }, function (mail) { return cy.wrap(mail).its('Snippet'); });
Cypress.Commands.add('mhGetSender', { prevSubject: true }, function (mail) { return cy.wrap(mail.From).its('Address'); });
Cypress.Commands.add('mhGetRecipients', { prevSubject: true }, function (mail) { return cy.wrap(mail.To.map(function (recipientObj) { return recipientObj.Address; })); });
Cypress.Commands.add('mhHasMailWithSubject', function (subject) { return cy.mhGetMailsBySubject(subject).should('not.have.length', 0); });
Cypress.Commands.add('mhHasMailFrom', function (from) { return cy.mhGetMailsBySender(from).should('not.have.length', 0); });
Cypress.Commands.add('mhHasMailTo', function (recipient) { return cy.mhGetMailsByRecipient(recipient).should('not.have.length', 0); });
