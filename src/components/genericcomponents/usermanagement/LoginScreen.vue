<template>
  <div class="grid">
    <div class="col-6">
      <h1>Mdr Notes</h1>
      <h2>Your Notes</h2>
      <h2>Your Thoughts</h2>
      <h2>Your Data</h2>
    </div>
    <div class="col-6">
      <h1>Mdr Notes</h1>
      <h2>Log In with a Solid Pod</h2>
      <h3>Use solidcommunity.net</h3>
      <Button label="Create a pod" class="p-m-2" style="align-content: start" />
      <Button label="Login" class="p-m-2" @click="login('community')" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  login,
  getDefaultSession,
  handleIncomingRedirect,
  ISessionInfo,
} from "@inrupt/solid-client-authn-browser";
import Button from "primevue/button";
export default defineComponent({
  name: "LoginScreen",
  components: {
    Button,
  },
  data() {
    return {
      issuers: {
        community: "https://solidcommunity.net/",
      } as { [index: string]: string },
    };
  },
  methods: {
    login(issuer: string) {
      handleIncomingRedirect({
        restorePreviousSession: true,
      }).then(() => {
        if (!getDefaultSession().info.isLoggedIn) {
          login({
            oidcIssuer: this.issuers[issuer],
            redirectUrl: `${process.env.VUE_APP_HOST}/callback`,
          }).then(() => {
            this.setLoginInformation(getDefaultSession().info);
          });
        } else {
          this.setLoginInformation(getDefaultSession().info);
          this.$router.push("/editor");
        }
      });
    },
    setLoginInformation(session: ISessionInfo) {
      if (session) {
        if (session.isLoggedIn === true) {
          if (session.webId) {
            const url = new URL(session.webId);
            localStorage.setItem("webId", url.href);
            localStorage.setItem("setUsername", url.hostname.split("-")[0]);
            localStorage.setItem("origin", url.origin);
            this.$store.commit("setWebId", url.href);
            this.$store.commit("setUsername", url.hostname.split("-")[0]);
            this.$store.commit("setOrigin", url.origin);
          }
        }
      }
    },
  },
});
</script>

<style scoped></style>
