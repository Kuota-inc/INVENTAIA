const Jimp = require('jimp');

(async () => {
  try {
    const image = await Jimp.read('public/logo.png');
    
    // The image is 1024x571
    // Top logo with slogan seems to be in the upper half. 
    // Let's crop from x: 150, y: 100 to w: 700, h: 200
    const topFull = image.clone().crop(150, 100, 750, 220);
    await topFull.writeAsync('public/logo-full.png');
    
    // Bottom logo without slogan seems to be around y: 350
    const bottomSmall = image.clone().crop(200, 380, 550, 150);
    await bottomSmall.writeAsync('public/logo-navbar.png');
    
    // Just the K (icon) is in the bottom left
    const icon = image.clone().crop(250, 380, 120, 150);
    await icon.writeAsync('public/icon.png');
    
    console.log("Images cropped successfully.");
  } catch (err) {
    console.error(err);
  }
})();
