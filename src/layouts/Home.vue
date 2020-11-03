<template>
  <v-app>
    <v-toolbar
        dark
        prominent
        max-height="11%"
        src="https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg"
    >
      <v-app-bar-nav-icon></v-app-bar-nav-icon>

      <v-toolbar-title>Draw together now!</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon>mdi-export</v-icon>
      </v-btn>
    </v-toolbar>
    <v-container fluid>
      <router-view></router-view>
    </v-container>
  </v-app>
</template>

<style scoped>
#login-page {
  background-color: #34495e;
}
</style>
