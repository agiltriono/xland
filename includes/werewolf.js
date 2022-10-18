const { embeds, clear } = require("../util/util");
function roles(name) {
	let role = [
		{
			name: 'moderator',
			emoji: "<:owner:1031680722198597732>",
			id: "1031680722198597732",
			power_limit: 0
		},
		{
			name: 'villager',
			emoji: "<:villager:1031680738451521578>",
			id: "1031680738451521578",
			power_limit: 0
		},
		{
			name: 'werewolf',
			emoji: "<:werewolf:1031680743539232788>",
			id: "1031680743539232788",
			power_limit: 0
		},
		{
			name: 'seer',
			emoji: "<:seer:1031680733212835860>",
			id: "1031680733212835860",
			power_limit: 0
		},
		{
			name: 'fool',
			emoji: "<:fool:1031680703492010025>",
			id: "1031680703492010025",
			power_limit: 0
		},
		{
			name: 'lycan',
			emoji: "<:lycan:1031680718746681354>",
			id: "1031680718746681354",
			power_limit: 1
		},
		{
			name: 'doppelganger',
			emoji: "<:doppelganger:1031680698936991764>",
			id: "1031680698936991764",
			power_limit: 2
		},
		{
			name: 'guardian',
			emoji: "<:guardian:1031680707476586536>",
			id: "1031680707476586536",
			power_limit: 0
		},
		{
			name: 'hunter',
			emoji: "<:Headhunter:1031680714976002099>",
			id: "1031680714976002099",
			power_limit: 0
		},
		{
			name: 'gunner',
			emoji: "<:gunner:1031680712140656721>",
			id: "1031680712140656721",
			power_limit: 2
		},
		{
			name: 'cupid',
			emoji: "<:cupid1:1031680695204053012>",
			id: "1031680695204053012",
			power_limit: 0
		}
	]
	return role.find(r => r.name === name)
}
module.exports = async function help(msg, args, creator, game, client, prefix) {
	var description = `**Cara Bermain Werewolf**
		Sebelum memulai permainan ini, ada baiknya kamu mengetahui latar belakang cerita terlebih dahulu. Tanpa mengetahuinya, sulit rasanya Moms bisa menikmati permainan ini tanpa harus kebingungan. Nah, berikut latar belakang cerita Werewolf.

		**Latar Belakang Cerita**
		Game werewolf merupakan permainan unik karena akan ada alur cerita yang kita ikuti, hingga dapat memilih siapakah werewolf diantara pemain. Pahami alur cerita sebelum tahu cara bermain werewolf. Awas, jangan sampai membunuh villager yang tidak bersalah!
		Latar belakang cerita dimulainya game werewolf adalah, ketika sebuah desa didatangi oleh siluman berwujud serigala (werewolf) yang memakan warga desa (villager) ketika malam tiba.
		Bila hari berganti siang, werewolf akan menyamar seolah-olah mereka adalah para villager yang juga terkejut dengan penemuan mayat dengan luka gigitan.
		Disinilah tugas para villager untuk menginterogasi orang-orang yang mencurigakan, serta menebak apakah benar mereka werewold atau bukan.
		Dalam proses interogasi, akan ada bala bantuan dari orang-orang profesional yang mengumpulkan berbagai bukti apakah benar orang tersebut adalah werewolf atau bukan. Mereka adalah Seer dan Detektif. Sedangkan proses interogasi akan dipimpin oleh moderator, yang juga pemegang time table permainan.

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

		${roles("werewolf").emoji} **3. Werewolf**
		Kelebihan: Saling tahu sesama serigala. Itu pun jika ada.
		Kelemahan: Bila kedokmu ketahuan, kamu bisa mati digantung warga desa di ujung senja.

		${roles("seer").emoji} **4. Seer/Cenayang**
		Kelebihan: Bisa mengetahui peran para pemain.
		Kelemahan: Tidak bisa percaya diri karena belum tentu cenayang murni.

		${roles("fool").emoji} **5. Fool/SeerKW**
		Kelebihan: Bisa nerawang.
		Kelemahan: Referensinya buku togel.

		${roles("lycan").emoji} **6. Lycan**
		Kelebihan: Bisa jadi serigala cadangan apabila diterawang seer tetapi warga baik aslinya.
		Kelemahan: Jika serigala menang ketika kamu belum berubah jadi serigala, kamu kalah. Jika warga desa menang, kamu juga kalah. oleh sebab itu tergantung posisi sudah diterawang atau belum (goodside/badside)

		${roles("doppelganger").emoji} **7. Doppelganger**
		Kelebihan: Bisa mewarisi kekuatan orang yang sudah mati.
		Kelemahan: Jika yang kamu pilih ternyata hanya warga desa biasa, kamu harus qonaah.

		${roles("guardian").emoji} **8. Guardian Angel**
		Kelebihan: Bisa melindungi orang lain dari terkaman serigala.
		Kelemahan: Jika melindungi serigala kemungkinan serigala menang.

		${roles("hunter").emoji} **9. Hunter**
		Kelebihan: Pendendam. Bisa membalas kematian.
		Kelemahan: Penakut. Mati aja minta ditemenin.

		${roles("gunner").emoji} **10. Gunner**
		Kelebihan: Punya satu pistol, 1/2 pelor.
		Kelemahan: Ketika pelurumu habis, kamu tidak bisa isi ulang dan harus menjadi warga desa biasa.

		${roles("cupid").emoji} **11. Cupid**
		Kelebihan: Bisa menjodohkan diri sendiri dengan orang lain. Apabila kamu menjodohkan diri sendiri dengan serigala, maka kamu telah membuat koalisi yang kuat.
		Kelemahan: Jika kamu salah menjodohkan orang lain, kamu bisa saja dibunuh oleh mereka. Cupid loses, love wins. Di saat pemain lain menang sebagai kekasih, kamu mati aja masih jomblo.
		_break_
		Ini dia Moms, cara bermain werewolf. Yuk disimak!

		**Malam Hari**

		Pada malam hari, werewolf akan memilih villager dan memakannya saat mereka tidur. Seer akan memilih seseorang untuk dibaca dan melihat apakah mereka adalah werewolf atau bukan.

		Moderator membuka permainan dengan mengatakan, "Sekarang malam hari, semua orang menutup mata dan menyenandungkan lagu pengantar tidur untuk dirimu sendiri sampai pagi."

		Lalu ucapkan, "Werewolf, buka matamu dan pilih korban untuk pesta malam ini."

		Werewolf akan menunjuk kepala korban untuk memilih.

		Setelah werewolf sudah memastikan korbannya, katakan, "Baiklah, korban malam ini telah dipilih. Werewolf, tutup matamu."

		Sekarang ucapkan "Seer, buka matamu dan tunjuk orang yang jiwanya ingin kamu lihat." Serta katakan, "Detektif, pilih satu nama yang ingin kamu selidiki."

		Jika seer dan detektif sudah menunjukkan siapa yang ingin dibaca, moderator dapat mengumumkan "werewolf" atau "villager" sesuai dengan kartu individu tersebut.

		**Pagi Hari**

		Pada pagi hari, pemain bisa mengaku tidak bersalah, meragukan kesaksian orang lain, atau menuduh satu sama lain. Pemain bisa mengatakan apa saja, tetapi orang mati harus tetap diam.

		Pada akhirnya, akan ada pemungutan suara tentang siapa yang menurut villager adalah werewolf, dan orang yang tidak beruntung itu akan digantung. Jika orang yang digantung adalah werewolf, permainan akan berakhir dan seluruhvillager akan hidup. Namun, jika orang yang digantung tidak bersalah, permainan berlanjut, dan Werewolf akan menemukan korban baru malam itu.`
	description = description.split(/_break_/gm)
	description.forEach(async item => {
		await msg.channel.send(embeds(item.trim()))
	})
	/*
	const queue = []
	description.forEach(async item => {
		const message = await msg.channel.send(embeds(item.trim()))
		await queue.push(message.id)
	})

	var interval = setInterval(async () => {
		if (description.length === queue.length) {
			clearInterval(interval)
			for (const id of queue) {
				let message = await msg.channel.messages.fetch(id);
				await clear(message, 4000)
			}
		}
	}, 100)*/
}