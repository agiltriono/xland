const { embeds, clear } = require("../util/util");
var randomize = function(array) {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}
var roles = function(name) {
	let role = [
		{
			name: 'villager',
			emoji: "<:villager:1031680738451521578>",
			id: "1031680738451521578"
		},
		{
			name: 'werewolf',
			emoji: "<:werewolf:1031680743539232788>",
			id: "1031680743539232788"
		},
		{
			name: 'seer',
			emoji: "<:seer:1031680733212835860>",
			id: "1031680733212835860"
		},
		{
			name: 'guardian',
			emoji: "<:guardian:1031680707476586536>",
			id: "1031680707476586536"
		},
		{
			name: 'hunter',
			emoji: "<:Headhunter:1031680714976002099>",
			id: "1031680714976002099"
		}
	]
	return role.find(r => r.name === name)
}
var emoji = function(no) {
	let emo = [
	  {
		emoji: "<:1_:1031215481371246592>",
		id: "1031215481371246592"
	  },
	  {
		emoji: "<:2_:1031215484529545318>",
		id: "1031215484529545318"
	  },
	  {
		emoji: "<:3_:1031215486337294468>",
		id: "1031215486337294468"
	  },
	  {
		emoji: "<:4_:1031215489428488402>",
		id: "1031215489428488402"
	  },
	  {
		emoji: "<:5_:1031215491936698398>",
		id: "1031215491936698398"
	  },
	  {
		emoji: "<:6_:1031215494822371468>",
		id: "1031215494822371468"
	  },
	  {
		emoji: "<:7_:1031215497536077965>",
		id: "1031215497536077965"
	  },
	  {
		emoji: "<:8_:1031215499712929792>",
		id: "1031215499712929792"
	  },
	  {
		emoji: "<:9_:1031215502372122724>",
		id: "1031215502372122724"
	  },
	  {
		emoji: "<:10_:1031215506688061671>",
		id: "1031215506688061671"
	  },
	  {
		emoji: "<:11_:1031215509506621510>",
		id: "1031215509506621510"
	  },
	  {
		emoji: "<:12_:1031215511859642428>",
		id: "1031215511859642428"
	  },
	  {
		emoji: "<:13_:1031215514720153620>",
		id: "1031215514720153620"
	  },
	  {
		emoji: "<:14_:1031215517308039280>",
		id: "1031215517308039280"
	  },
	  {
		emoji: "<:15_:1031215519577157632>",
		id: "1031215519577157632"
	  }
	]
	return emo[no]
}
var playerlist = function(player, tamat){
	var pemain;
	if (tamat == false) {
	  let kehidupan = player.filter(u=>u.status === hidup)
	  let kematian = player.filter(u=>u.status === mati)
		pemain = `**Alam Kehidupan**\n${kehidupan.map(u=>`${u.status} <@${u.id}> ${u.saved_by != "" ? `**Saved by ${u.saved_by.capitalize()}**` : ""}`).join("\n")}\n**Alam Kematian**\n${kematian.length != 0 ? kehidupan.map(u=>`${u.status} <@${u.id}> ${u.killed_by != "" ? `Killed by **${u.killed_by.capitalize()}**` : ""}`).join("\n") : 'Hmmm....'}`
	} else {
		return player.map(p => `${p.status == hidup ? hidup : mati} ${roles(p.role).emoji} ${p.status == hidup ? `<@${p.id}>` : p.name}`)
	}
}


exports.randomize = randomize;
exports.roles = roles;
exports.emoji = emoji;
exports.playerlist = playerlist;

module.exports = async function help(msg, args, creator, client, prefix) {
	var description = `**Cara Bermain Werewolf**
		Cara bermain werewolf yang pertama adalah tahu pembagian peran untuk setiap pemain. Sebelum memulai waktu malam hari yang juga mengawali peramainan, akan ada moderator yang membagi peran untuk setiap pemain. Jika Moms terpilih menjadi moderator, maka ini adalah penjelasan pembagian peran pemain.
		_break_
		${roles("moderator").emoji} **A. Moderator**
		Sebelum mulai permainan, moderator bertugas untuk membagi peran bagi setiap orang. Pembagian tersebut bisa menggunakan kertas atau bisikan.
		Moderator juga merupakan orang yang membaca hasil vote sebelum membunuh werewolf dan membuat pengumuman tentang apa yang terjadi, untuk melindungi identitas werewolf, seer, detektif, dan villager.
		Moderator akan memastikan permainan dimainkan sesuai aturan, sehingga tidak ada kecurangan. Peran ini adalah yang termudah dalam permainan, karena moderator tidak bisa benar-benar menang atau kalah. Tetapi adalah yang paling sulit karena memiliki tanggung jawab selama permainan berjalan. Dibutuhkan banyak usaha untuk tetap diam tidak mengungkapkan identitas pemain, ketika semua orang sedang bertengkar satu sama lain.
		Secara garis besar, tugas moderator adalah:
		1. Memberi tahu perubahan waktu siang dan malam hari.
		2. Mengumpulkan hasil vote pemain.
		3. Membacakan hasil vote untuk siapa yang akan dibunuh.
		4. Mengumumkan siapa yang terbunuh oleh werewolf di malam hari.
		5. Memantau jumlah pemain.
		6. Memberi clue untuk seer dan detektif jika diperlukan.
		
		${roles("villager").emoji} **1. Villager/Warga**
		Kelebihan: Jumlah lebih banyak dari serigala.
		Kelemahan: Hanya bisa pasrah menunggu ajal menjemput.

		${roles("werewolf").emoji} **2. Werewolf**
		Kelebihan: Saling tahu sesama serigala. Itu pun jika ada.
		Kelemahan: Bila kedokmu ketahuan, kamu bisa mati digantung warga desa di ujung senja.

		${roles("seer").emoji} **3. Seer/Cenayang**
		Kelebihan: Bisa mengetahui peran para pemain.
		Kelemahan: Tidak bisa percaya diri karena belum tentu cenayang murni.

		${roles("guardian").emoji} **4. Guardian**
		Kelebihan: Bisa melindungi orang lain dari terkaman serigala.
		Kelemahan: Jika melindungi serigala kemungkinan serigala menang.

		${roles("hunter").emoji} **5. Hunter**
		Kelebihan: Pendendam. Bisa membalas kematian.
		Kelemahan: Penakut. Mati aja minta ditemenin.
		_break_
		Ini dia cara bermain werewolf. Yuk disimak!

		**Malam Hari**
		Pada malam hari, werewolf akan memilih villager dan memakannya saat mereka tidur. Seer akan memilih seseorang untuk dibaca dan melihat apakah mereka adalah werewolf atau bukan.

		Moderator membuka permainan dengan mengatakan, "Sekarang malam hari, semua orang menutup mata dan menyenandungkan lagu pengantar tidur untuk dirimu sendiri sampai pagi."

		Lalu ucapkan, "Werewolf, buka matamu dan pilih korban untuk pesta malam ini."

		Werewolf akan memilih korban.

		Setelah werewolf sudah memastikan korbannya, katakan, "Baiklah, korban malam ini telah dipilih. Werewolf, tutup matamu."

		Sekarang ucapkan "Seer, buka matamu dan tunjuk orang yang jiwanya ingin kamu lihat."

		Jika seer sudah menunjukkan siapa yang ingin dibaca, moderator dapat mengumumkan "werewolf" atau "villager" sesuai dengan kartu individu tersebut.

		**Pagi Hari**
		Pada pagi hari, pemain bisa mengaku tidak bersalah, meragukan kesaksian orang lain, atau menuduh satu sama lain. Pemain bisa mengatakan apa saja, tetapi orang mati harus tetap diam.

		Pada akhirnya, akan ada pemungutan suara tentang siapa yang menurut villager adalah werewolf, dan orang yang tidak beruntung itu akan digantung. Jika orang yang digantung adalah werewolf, permainan akan berakhir dan seluruh villager akan hidup. Namun, jika orang yang digantung tidak bersalah, permainan berlanjut, dan Werewolf akan menemukan korban baru malam itu.`
	description = description.split(/_break_/gm)
	description.forEach(async item => {
		await msg.channel.send(embeds(item.trim()))
	})
}