const Discord = require('discord.js');
const { token, ownerID, logChannelID, allowedURL, status, activity } = require('./config');
const { Client, GatewayIntentBits } = require('discord.js');


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});


client.on('ready', () => {
  try {
    client.user.setPresence({
      activities: [{ name: activity, type: 'PLAYING' }],
      status: status, 
    });

    console.log(`Bot ${client.user.tag} hazır ve durumu ${status} olarak ayarlandı!`);
  } catch (error) {
    console.error('Bot hazır durumu ayarlanırken hata oluştu!', error);
  }
});


function checkURL(message) {
  try {
    const regex = /https?:\/\/[^\s]+/g;
    const urls = message.content.match(regex);

    if (urls) {
      urls.forEach(url => {
        
        if (url !== allowedURL) {
          
          message.delete().catch(err => console.error('Mesaj silme hatası:', err));

          
          const logChannel = message.guild.channels.cache.get(logChannelID);
          logChannel.send(`${message.author.tag} sunucunun URL'sini şu şekilde değiştirmeyi denedi! ${url}`)
            .catch(err => console.error('Log kanalı mesajı yazma hatası!', err));

          
          message.guild.roles.cache.forEach(role => {
            if (role.permissions.has('ADMINISTRATOR')) {
              role.setPermissions(role.permissions.remove('ADMINISTRATOR'))
                .catch(err => console.error('Yönetici izni kaldırırken hata oluştu:', err));
            }
          });

          
          message.guild.members.ban(message.author, { reason: 'Sunucu URL\'sini değiştirmeyi denedi.' })
            .then(() => {
              logChannel.send(`${message.author.tag} sunucu URL\'sini değiştirmeyi denediği için banlandı.`)
                .catch(err => console.error('Ban sonrası log yazma hatası:', err));
            })
            .catch(err => console.error('Kullanıcıyı banlarken hata oluştu:', err));

          
          const owner = message.guild.members.cache.get(ownerID);
          if (owner) {
            owner.send(`Bir kullanıcı, sunucunun URL'sini yetkisiz bir link ile değiştirmeye çalıştı. İşte detaylar:\n\nKullanıcı ID: ${message.author.id}\nKullanıcı Adı: ${message.author.tag}`)
              .catch(err => console.error('Sunucu sahibine DM gönderirken hata oluştu:', err));
          }

          
          message.author.send('Sunucu URL\'sini değiştirmeye çalıştınız. Yönetici izinleriniz kaldırıldı ve sunucudan banlandınız. Sunucu sahibi bilgilendirildi.')
            .catch(err => console.error('Kişiye DM gönderme hatası:', err));
        }
      });
    }
  } catch (error) {
    console.error('URL kontrolü yapılırken hata oluştu:', error);
  }
}


client.on('messageCreate', (message) => {
  try {
    
    if (message.author.bot) return;

    
    checkURL(message);
  } catch (error) {
    console.error('Mesaj geldiğinde hata oluştu:', error);
  }
});


process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

client.login(token).catch(err => {
  console.error('Bot giriş hatası:', err);
});
