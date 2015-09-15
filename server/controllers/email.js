
/**
 * Provides methods for sending emails via Mandrill
 * @class email
 * @static
 */
var mandrill = require('mandrill-api/mandrill');
var mandrillAPIKey = process.env.MANDRILL_API_KEY || require('../../config/config').MandrillAPIKey;
var mandrill_client = new mandrill.Mandrill(mandrillAPIKey);
var utils = require('./utils');
  
module.exports = {
  /**
   *  Sends an invitation email via Mandrill to invitee
   *  with a link with the inviteId appended to accept invitation
   *
   *  @method sendInvitationEmail
   *  @param {string}     inviteeEmail
   *  @param {string}     inviteId
   */
  sendInvitationEmail : function(inviteeEmail, inviteId) {
    var link = "http://localhost:1337/user/invite/" + inviteId;
    var message = {
      html: "<p>You have been invited to join a household in Rosie!" +
            "Click on the link below to accept the invitation!</p>" +
            "<a>" + link + "</a",
      subject: "Test email",
      from_email: "kamharrah@gmail.com",
      from_name: "Rosie",
      to: [{
        email: inviteeEmail,
        type: "to"
      }],
      important: false
    };

    mandrill_client.messages.send({
        message: message,
        async: true,
        ip_pool: "Main Pool",
        sent_at: "example sent_at"
      }, function(result) {
        console.log(result);
      }, function(err) {
        console.error(err);
      });
  }

};
