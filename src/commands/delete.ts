import { Command } from './Command';
import { Emojis } from '../Constants';
import { TicketRenderer } from '../renderers';

export const deleteCommand: Command = {
  name: 'delete',
  aliases: ['remove', 'del'],
  help: '<ticket id> [--override]',
  execute: async ({ client, msg, args, db }) => {
    if (!args[0]) {
      return `specify a ticket ID and try again ${Emojis.GUCCI_REE}`;
    }

    let override = args.includes('--override') && args.splice(args.indexOf('--override'), 1);
    const ticket = await db.tickets.getTicket(+args[0]);
    if (!ticket) {
      return `no ticket with ID #${args[0]} ${Emojis.GUCCI_PANIC_2}`;
    }
    if (
      (ticket.userID !== msg.author.id && !override) &&
      !client.opts.owners.includes(msg.author.id)
    ) {
      return `you don't own this ticket ${Emojis.GUCCI_PANIC_2}\n(run again with \`--override\` to delete the ticket if this was not a mistake)`;
    }

    for (const recipient of ticket.recipients) {
      client.editMessage(recipient.channelID, recipient.messageID, {
        embed: TicketRenderer.render(ticket, client.users.get(ticket.userID), TicketRenderer.States.CLOSED, msg.author)
      }).catch(() => {});
    }

    await db.tickets.deleteTicket(ticket._id);

    return {
      title: `Deleted ticket #${ticket._id} ${Emojis.GUCCI_SCREAM}`
    };
  }
};

