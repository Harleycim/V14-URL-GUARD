const { allowedURL, ownerID } = require('../config');

module.exports = function checkURL(message) {
  const regex = /https?:\/\/[^\s]+/g;
  const urls = message.content.match(regex);

  if (urls) {
    urls.forEach(url => {
      
      if (url !== allowedURL) {
        
        message.delete();

        
        const logChannel = message.guild.channels.cache.get(config.logChannelID);
        logChannel.send(`${message.author.tag} sunucu URL'sini değiştirmeye çalıştı! ${url}`);

        
        const member = message.guild.members.cache.get(message.author.id);
        const adminRole = member.roles.cache.find(role => role.permissions.has('ADMINISTRATOR'));

        if (adminRole) {
          member.roles.remove(adminRole)
            .then(() => {
              logChannel.send(`${message.author.tag}'URL'yi değiştirmeye çalıştığı için yönetici rolü kaldırıldı.`);
            })
            .catch(err => console.error('Rol kaldırma başarısız oldu!', err));
        }

        
        const owner = message.guild.members.cache.get(ownerID);
        owner.send(`${message.author.tag} sunucu URL'sini yetkisiz bir URL ile değiştirmeye çalıştı! ${url}`);

        
        message.author.send('Sunucu URLsini değiştirmeye çalıştınız, yönetici izinleriniz iptal edildi ve sunucu sahibi bilgilendirildi.');
      }
    });
  }
};
