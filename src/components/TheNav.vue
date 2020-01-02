<template>
  <div class="w-full border-b">
    <nav class="flex max-w-9xl mx-auto items-center py-3 px-8 justify-between">
      <div class="flex items-center">
        <h1 class="mr-8 font-bold">Colors</h1>
        <label class="font-semibold">Palette</label>
        <select class="ml-3 rounded shadow font-semibold bg-white py-1 px-3 h-8">
          <option>Tailwind colors</option>
        </select>
      </div>
      <div>
        <Button>Reset</Button>
        <Button icon="arrow-down">Sketch Palette</Button>
        <Button icon="copy">Copy CSS</Button>
      </div>
    </nav>
  </div>
</template>
