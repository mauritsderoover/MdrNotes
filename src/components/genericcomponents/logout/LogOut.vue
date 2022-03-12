<script lang="ts">
import { logout } from "@inrupt/solid-client-authn-browser";
import { defineComponent } from "vue";

export default defineComponent({
  name: "LogOut",
  mounted() {
    logout().then(() => {
      this.$router.push("/");
    });
  },
});
</script>

<style scoped></style>
