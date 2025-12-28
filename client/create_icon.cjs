
const { Jimp } = require('jimp');

async function main() {
    try {
        console.log('Reading public/icon_512x512.png...');
        const logo = await Jimp.read('public/icon_512x512.png');
        const backgroundColor = "#ffffff";

        // V11 Generation - Multiple Sizes per iOS Requirements
        const sizes = [
            { name: 'apple-touch-icon-180x180.png', size: 180 },
            { name: 'apple-touch-icon-167x167.png', size: 167 },
            { name: 'apple-touch-icon-152x152.png', size: 152 },
            { name: 'apple-touch-icon-120x120.png', size: 120 },
        ];

        for (const { name, size } of sizes) {
            const icon = new Jimp({ width: size, height: size, color: backgroundColor });
            const logoClone = logo.clone();
            logoClone.cover({ w: size, h: size });
            icon.composite(logoClone, 0, 0);
            await icon.write(`public/${name}`);
            console.log(`Created ${name}`);
        }

        // Default apple-touch-icon.png (180x180)
        const defaultIcon = new Jimp({ width: 180, height: 180, color: backgroundColor });
        const logoForDefault = logo.clone();
        logoForDefault.cover({ w: 180, h: 180 });
        defaultIcon.composite(logoForDefault, 0, 0);
        await defaultIcon.write('public/apple-touch-icon.png');
        console.log('Created apple-touch-icon.png (Default 180x180)');

        // Android/Chrome: 192x192
        const icon192 = new Jimp({ width: 192, height: 192, color: backgroundColor });
        const logo192 = logo.clone();
        logo192.cover({ w: 192, h: 192 });
        icon192.composite(logo192, 0, 0);
        await icon192.write('public/icon-192.png');
        console.log('Created icon-192.png');

        // Android/Chrome: 512x512
        const icon512 = new Jimp({ width: 512, height: 512, color: backgroundColor });
        const logo512 = logo.clone();
        logo512.cover({ w: 512, h: 512 });
        icon512.composite(logo512, 0, 0);
        await icon512.write('public/icon-512.png');
        console.log('Created icon-512.png');

    } catch (err) {
        console.error('Error creating icons:', err);
        process.exit(1);
    }
}

main();
