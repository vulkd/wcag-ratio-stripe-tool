<template>
  <div id="app" class="m-auto font-sans subpixel-antialiased min-h-screen bg-white text-gray-800">

    <div ref="tooltip" v-show="showTooltip" class="pointer-events-none bg-white shadow text-xs px-3 py-1 rounded z-50 fixed">
      {{ tooltipContent }}
    </div>

    <TheNav></TheNav>

    <main v-if="colors" class="flex flex-col lg:flex-row max-w-9xl mx-auto py-8 px-8">

      <!-- left palette table -->
      <div class="w-full lg:w-1/3 mr-6">
        <div class="flex justify-between">
          <h2 class="text-lg py-1">Tailwind colors</h2>
          <div class="text-gray-600">
            <Icon class="cursor-pointer ml-3" name="lock" scale=".8"></Icon>
            <Icon class="cursor-pointer ml-3" name="redo" scale=".8"></Icon>
            <Icon class="cursor-pointer ml-3" name="times" scale=".8"></Icon>
          </div>
        </div>
        <table class="text-xs table-fixed text-gray-600 w-full">
          <thead>
           <tr>
             <th v-for="i in values" class="font-normal">{{i}}</th>
           </tr>
         </thead>
         <tbody>
          <tr v-for="color in colorsLabels">
            <td class="text-right pr-1">{{ color.charAt(0).toUpperCase() + color.slice(1) }}</td>
            <td
            @mouseover="onMouseoverCell($event, colors[color][i].hex)"
            @mouseleave="showTooltip = false"
            @click="selectedColor = color; selectedValue=i"
            v-for="i in values"
            class="cursor-pointer text-center"
            :class="`${selectedColor === color && selectedValue === i ? 'active-cell' : ''}`"
            :style="{'background-color': colors[color][i].hex, 'color': getCorrectTextColor(colors[color][i].hex)}"
            >{{ colors[color][i].wcagRatio }}</td>
          </tr>
        </tbody>
      </table>
      <div class="flex justify-center items-center py-6">
        <label class="font-semibold">Overlay</label>
        <select class="ml-3 rounded shadow font-semibold bg-white py-1 px-3 h-8">
          <option>WCAG contrast</option>
        </select>
      </div>
    </div>

    <!-- right -->
    <div class="w-full lg:w-2/3 lg:ml-6 lg:flex">
      <!-- selected color scales -->
      <div class="w-full lg:w-1/2 lg:mr-6 mt-6 lg:mt-0">
        <div>
          <div class="flex justify-between">
            <h2 class="text-lg py-1">{{ selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1) }}</h2>
            <div class="text-gray-600">
              <Icon class="cursor-pointer ml-3" name="redo" scale=".8"></Icon>
              <Icon class="cursor-pointer ml-3" name="times" scale=".8"></Icon>
            </div>
          </div>
          <table class="text-xs table-fixed text-gray-600 w-full">
            <thead>
              <tr>
                <th class="font-normal px-1" v-for="i in values">{{i}}</th>
              </tr>
            </thead>
            <tbody>
              <td @click="selectedValue = i" class="cursor-pointer" v-for="i in values" :class="`${selectedValue === i ? 'active-cell' : ''}`" :style="{'background-color': colors[selectedColor][i].hex}"></td>
            </tbody>
          </table>
        </div>
        <div class="mt-6">
          <h3 class="font-semibold pt-4 pb-2 text-sm">Lightness</h3>
          <AdjustableLineChart k="l" @change="onChangeLightness" :colors="currentL" :selectedColor="selectedColor" :selectedValue="selectedValue"/>
        </div>
        <div class="mt-6">
          <h3 class="font-semibold pt-4 pb-2 text-sm">Chroma</h3>
          <AdjustableLineChart k="c" @change="onChangeChroma" :colors="currentC" :selectedColor="selectedColor" :selectedValue="selectedValue"/>
        </div>
        <div class="mt-6">
          <h3 class="font-semibold pt-4 pb-2 text-sm">Hue</h3>
          <AdjustableLineChart k="h" @change="onChangeHue" :colors="currentH" :selectedColor="selectedColor" :selectedValue="selectedValue"/>
        </div>
      </div>

      <!-- palette scales -->
      <div class="w-full lg:w-1/2 lg:ml-6 mt-6 lg:mt-0">
        <div>
          <div class="flex justify-between">
            <h2 class="text-lg py-1">{{ selectedValue }}</h2>
            <div class="text-gray-600">
              <Icon class="cursor-pointer ml-3" name="redo" scale=".8"></Icon>
              <Icon class="cursor-pointer ml-3" name="times" scale=".8"></Icon>
            </div>
          </div>
          <table class="text-xs table-fixed text-gray-600 w-full">
            <thead>
              <tr>
                <th v-for="color in colorsLabels" class="font-normal px-1" style=" transform: rotate(-45deg);">{{ color.charAt(0).toUpperCase() + color.slice(1) }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td v-for="color in colorsLabels" @click="selectedColor = color" class="cursor-pointer" :class="`bg-${color}-${selectedValue} ${selectedColor === color ? 'active-cell' : ''}`"></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-6">
          <h3 class="font-semibold pt-4 pb-2 text-sm">Lightness</h3>
          <AdjustableLineChart k="l"  @change="onChangeLightness"  :colors="allL" :selectedColor="selectedColor" :selectedValue="selectedValue"/>
        </div>
        <div class="mt-6">
          <h3 class="font-semibold pt-4 pb-2 text-sm">Chroma</h3>
          <AdjustableLineChart k="c" :colors="allC" :selectedColor="selectedColor" :selectedValue="selectedValue"/>
        </div>
        <div class="mt-6">
          <h3 class="font-semibold pt-4 pb-2 text-sm">Hue</h3>
          <AdjustableLineChart k="h" :colors="allH" :selectedColor="selectedColor" :selectedValue="selectedValue"/>
        </div>
      </div>
    </div>
  </main>

</div>
</template>

<script>
import contrast from 'get-contrast'
import { hex2rgb, rgb2hex, rgb2hsl, lab2rgb, rgb2lab, getCorrectTextColor } from "@/lib/colors.js"

import TheNav from "@/components/TheNav";
import AdjustableLineChart from "@/components/AdjustableLineChart";

export default {
  components: {
    TheNav,
    AdjustableLineChart
  },
  data() {
    return {
      palette: {gray: {100: '#f7fafc',200: '#edf2f7',300: '#e2e8f0',400: '#cbd5e0',500: '#a0aec0',600: '#718096',700: '#4a5568',800: '#2d3748',900: '#1a202c',},red: {100: '#fff5f5',200: '#fed7d7',300: '#feb2b2',400: '#fc8181',500: '#f56565',600: '#e53e3e',700: '#c53030',800: '#9b2c2c',900: '#742a2a',},orange: {100: '#fffaf0',200: '#feebc8',300: '#fbd38d',400: '#f6ad55',500: '#ed8936',600: '#dd6b20',700: '#c05621',800: '#9c4221',900: '#7b341e',},yellow: {100: '#fffff0',200: '#fefcbf',300: '#faf089',400: '#f6e05e',500: '#ecc94b',600: '#d69e2e',700: '#b7791f',800: '#975a16',900: '#744210',},green: {100: '#f0fff4',200: '#c6f6d5',300: '#9ae6b4',400: '#68d391',500: '#48bb78',600: '#38a169',700: '#2f855a',800: '#276749',900: '#22543d',},teal: {100: '#e6fffa',200: '#b2f5ea',300: '#81e6d9',400: '#4fd1c5',500: '#38b2ac',600: '#319795',700: '#2c7a7b',800: '#285e61',900: '#234e52',},blue: {100: '#ebf8ff',200: '#bee3f8',300: '#90cdf4',400: '#63b3ed',500: '#4299e1',600: '#3182ce',700: '#2b6cb0',800: '#2c5282',900: '#2a4365',},indigo: {100: '#ebf4ff',200: '#c3dafe',300: '#a3bffa',400: '#7f9cf5',500: '#667eea',600: '#5a67d8',700: '#4c51bf',800: '#434190',900: '#3c366b',},purple: {100: '#faf5ff',200: '#e9d8fd',300: '#d6bcfa',400: '#b794f4',500: '#9f7aea',600: '#805ad5',700: '#6b46c1',800: '#553c9a',900: '#44337a',},pink: {100: '#fff5f7',200: '#fed7e2',300: '#fbb6ce',400: '#f687b3',500: '#ed64a6',600: '#d53f8c',700: '#b83280',800: '#97266d',900: '#702459'}},
      values: [100,200,300,400,500,600,700,800,900],
      selectedColor: "blue",
      selectedValue: 500,
      tooltipContent: null,
      showTooltip: false
    }
  },
  computed: {
    colorsLabels() {
      return Object.keys(this.palette)
    },
    currentL() {
      return Object.values(this.colors[this.selectedColor]).map(c => ({...c,x: c.l}));
    },
    currentC() {
      return Object.values(this.colors[this.selectedColor]).map(c => ({...c,x: c.c}));
    },
    currentH() {
      return Object.values(this.colors[this.selectedColor]).map(c => ({...c,x: c.h}));
    },
    allL() {
      return Object.values(this.colors).map(v => ({ ...v[this.selectedValue], x: v[this.selectedValue].l }));
    },
    allC() {
      return Object.values(this.colors).map(v => ({ ...v[this.selectedValue], x: v[this.selectedValue].c }));
    },
    allH() {
      return Object.values(this.colors).map(v => ({ ...v[this.selectedValue], x: v[this.selectedValue].h }));
    },
    colors() {
      const output = {};
      for (const color of Object.keys(this.palette)) {
        output[color] = {}
        for (const v of Object.keys(this.palette[color])) {
          const hex = this.palette[color][v]
          const hsl = rgb2hsl(...hex2rgb(hex))
          const lab = rgb2lab(hex2rgb(hex))
          output[color][v] = {
            color,
            hex,
            l: lab[0],
            c: lab[1],
            h: lab[2],
            hslL: hsl.v,
            hslS: hsl.s,
            hslH: hsl.h,
            wcagRatio: contrast.ratio(hex, this.getCorrectTextColor(hex)).toFixed(2),
            wcagScore: contrast.score(hex, this.getCorrectTextColor(hex))
          }
        }
      }
      return output
    }
  },
  methods: {
    onMouseoverCell(e, content) {
      const tooltip = this.$refs.tooltip;
      tooltip.style.left = e.clientX + "px";
      tooltip.style.top = e.clientY + "px";
      this.showTooltip = true;
      this.tooltipContent = content;
    },
    getCorrectTextColor(color) {
      return getCorrectTextColor(color) === "#ffffff" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"
    },
    onChangeLightness({selectedValueIdx, value, color}) {
      const selectedValue = Object.keys(this.colors[color])[selectedValueIdx];
      const c = this.colors[color][selectedValue];
      const rgb = lab2rgb([value, c.c, c.h]);
      this.palette[color][selectedValue] = rgb2hex(...rgb.map(x => parseInt(x)));
    },
    onChangeChroma({selectedValueIdx, value}) {
      const selectedValue = Object.keys(this.colors[this.selectedColor])[selectedValueIdx];
      const color = this.colors[this.selectedColor][selectedValue];
      const rgb = lab2rgb([color.l, value, color.h]);
      this.palette[this.selectedColor][selectedValue] = rgb2hex(...rgb.map(x => parseInt(x)));
    },
    onChangeHue({selectedValueIdx, value,}) {
      const selectedValue = Object.keys(this.colors[this.selectedColor])[selectedValueIdx];
      const color = this.colors[this.selectedColor][selectedValue];
      const rgb = lab2rgb([color.l, color.c, value]);
      this.palette[this.selectedColor][selectedValue] = rgb2hex(...rgb.map(x => parseInt(x)));
    }
  }
};
</script>

<style scoped>
th, td {
  height: 2.2rem;
  position: relative;
}

.active-cell:before {
  content: "";
  position: absolute;
  top: -2px;
  left: -2px;
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  border: 1px solid #ccc;
  border-radius: 4px;
  z-index: 1;
}

.active-cell:after {
  content: "";
  position: absolute;
  top: -1px;
  left: -1px;
  width: calc(100% + 2px);
  height: calc(100% + 2px);
  border: 1px solid #fff;
  border-radius: 3px;
  z-index: 1;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
</style>
