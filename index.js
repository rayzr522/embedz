const fs = require('fs');

const discord = require('discord.js');
const bot = new discord.Client();
const parser = require('./parser');

const config = (() => {
    if (!fs.existsSync('config.json')) {
        console.error('Please rename config.json.example to config.json and fill out the information.');
        process.exit(1);
    }

    const content = fs.readFileSync('config.json').toString();
    try {
        return JSON.parse(content);
    } catch (err) {
        console.error('Failed to parse JSON file:', err);
        process.exit(1);
    }
})();

// This is a temporary method which currently only creates an embed with the content. There'll be more options later.
// For now, I don't want to set up any parsing code :P
const parseEmbed = content => {
    let parsed = parser(content);

    // TODO: Improve this, actually make it parse things.
    let { options, remainder } = parsed;

    if (options.color && /^[a-f0-9]{3}$/i.test(options.color)) {
        options.color = options.color.split('').map(c => c + c).join('');
    }

    let embed = new discord.RichEmbed()
        .setColor(options.color || config.embedSettings.defaultColor)
        .setTitle(options.title || '')
        .setURL(options.url)
        .setAuthor(options.author || '', options.authorIcon)
        .setFooter(options.footer || '', options.footerIcon)
        .setImage(options.image || '')
        .setThumbnail(options.thumbnail || '')
        .setDescription(parsed.remainder);

    if (options.timestamp) {
        embed.setTimestamp(new Date());
    }

    return embed;
};

bot.on('ready', () => {
    if (bot.user.bot) {
        console.error('This is a selfbot, but you provided a bot token. Please provide your user token.');
        process.exit(1);
    }
    
    console.log(`Logged in as ${bot.user.tag} (ID: ${bot.user.id})`);
    console.log(`Prepared to embed in ${bot.guilds.size} guilds!`);
});

bot.on('message', message => {
    if (!message.author.id === bot.user.id) {
        return;
    }

    if (!message.content.startsWith(config.prefix)) {
        return;
    }

    message.delete();
    if (!message.member.hasPermission("EMBED_LINKS")) {
        console.error(`Tried to embed, but was cancelled due to lack of permissions:\n${content}`);
        return;
    }

    let content = message.content.substr(config.prefix.length);
    let embed;
    try {
        embed = parseEmbed(content);
    } catch (err) {
        if (typeof err === 'string') {
            message.channel.send(`:x: ${err}`)
                .then(m => m.delete(3000));
        }
        return console.error('Encountered error while parsing embed:', err);
    }

    message.channel.send({ embed });
});

bot.on('error', code => {
    if (code === 4004) {
        console.error('Invalid token! Please check that you entered the correct token for your account.');
        process.exit(1);
    }
});

config.token && bot.login(config.token).catch(err => {
    console.error('Failed to log in:', err);
    process.exit(1);
});