<script lang="ts">
import {
  getDefaultSession,
  handleIncomingRedirect,
  ISessionInfo,
} from "@inrupt/solid-client-authn-browser";
import { defineComponent } from "vue";

export default defineComponent({
  name: "call-back",
  beforeMount() {
    console.log("this has been reached");

    handleIncomingRedirect({ restorePreviousSession: true }).then(() => {
      this.setLoginInformation(getDefaultSession().info);
      this.$router.push("/editor");
    });
  },
  methods: {
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
