
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
      html: '<p>You have been invited to join a household in Otto!<br>' +
            'Click on the link below to accept the invitation.</p><br><br>' +
            '<a href="'+link+'">Accept Invitation</a>',
      subject: "Otto - Invitation to Join Household",
      from_email: "kamharrah@gmail.com",
      from_name: "Otto",
      to: [{
        email: inviteeEmail,
        type: "to"
      }]
    };

    mandrill_client.messages.send({
        message: message,
        async: true
      }, function(result) {
        console.log(result);
      }, function(err) {
        console.error(err);
      });
  }

};
