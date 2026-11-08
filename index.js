import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import { GoogleGenAI } from '@google/genai';
import readline from 'readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ai = new GoogleGenAI({ apiKey: 'AQ.Ab8RN6Lp2FhP6I6qxTRahXERX-mx-7Q_jObcBmZ3xjxiRs0dRQ' });

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false // কিউআর কোড বন্ধ রাখা হলো
    });

    if (!sock.authState.creds.registered) {
        const phoneNumber = await new Promise((resolve) => {
            rl.question('📞 আপনার WhatsApp নম্বরটি দিন (যেমন 8801805228668): ', (ans) => {
                resolve(ans.trim());
            });
        });

        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log(`\n🔑 আপনার ৮ ডিজিটের Pairing Code: \x1b[32m${code}\x1b[0m\n`);
            } catch (error) {
                console.error('Pairing Code নিতে সমস্যা হয়েছে:', error);
            }
        }, 4000);
    }

    sock.creds?.update && sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
            console.log("✅ আলহামদুলিল্লাহ! WhatsApp সফলভাবে কানেক্ট হয়েছে এবং বোট লাইভ আছে!");
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;
        const sender = m.key.remoteJid;
        const messageText = m.message.conversation || m.message.extendedTextMessage?.text;
        if (!messageText) return;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: messageText,
            });
            await sock.sendMessage(sender, { text: response.text });
        } catch (err) {
            console.error('এআই রেসপন্স দিতে সমস্যা হয়েছে:', err);
        }
    });
}

connectToWhatsApp();
const http = require('http');
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WhatsApp Bot is running successfully!');
}).listen(PORT, () => {
  console.log(`HTTP server is listening on port ${PORT}`);
});
import http from 'http';
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WhatsApp Bot is running successfully!');
}).listen(PORT, () => {
  console.log(`HTTP server is listening on port ${PORT}`);
});
