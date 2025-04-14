// import fetch from 'node-fetch';
// import dotenv from 'dotenv';
// dotenv.config();

// export default async function virustotal(url) {
//     try {
//         const submitRes = await fetch('https://www.virustotal.com/api/v3/urls', {
//             method: 'POST',
//             headers: {
//                 'x-apikey': process.env.virustotal_API,
//                 'Content-Type': 'application/x-www-form-urlencoded',
//             },
//             body: `url=${encodeURIComponent(url)}`
//         });
//         const submitData = await submitRes.json();
//         const scanId = submitData.data.id;
//         let result_Data;
//         let status = '';
//         let sec = 0;
//         while (status !== 'completed') {
//             const resultRes = await fetch(`https://www.virustotal.com/api/v3/analyses/${scanId}`, {
//                 method: 'GET',
//                 headers: {
//                     'x-apikey': process.env.virustotal_API,
//                 }
//             });
//             result_Data = await resultRes.json();
//             status = result_Data.data.attributes.status;
//             sec++;
//             if (status !== 'completed') {
//                 await new Promise((res) => setTimeout(res, 1000));
//             }
//         }
//         // console.log('Scan Completed ✅');
//         // console.log('Time Taken :⏱️ ', sec,'s');
//         return result_Data.data.attributes.stats;
//     } catch (err) {
//         console.error('Error with VirusTotal 🛑:', err);
//         return err;
//     }
// }
