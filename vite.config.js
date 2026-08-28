import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Göreli yollarla derle.
  //
  // Sebep: bu pano iki bilgisayar arasında taşınıyor. İş bilgisayarında
  // planlama yapılıyor, oyun kişisel bilgisayarda geliştiriliyor. Mutlak
  // yolla derlenmiş bir çıktı ancak bir sunucu üstünden açılır; göreli
  // yolla derlenirse `dist` klasörü olduğu gibi taşınıp `index.html`
  // çift tıklanarak açılabilir, Node kurulu olmasa bile.
  //
  // İkinci sebep: bu bilgisayardaki geliştirme araçları 30 gün sonunda
  // kaldırılacak. Derlenmiş pano o zaman da çalışmaya devam etmeli.
  base: './',
  plugins: [react()],
})
