<template>
<div>
  <nav>
      <div class="nav-wrapper container" role="navigation">
        <a id="logo-container" href="/" class="brand-logo"><font size="2">オリンピック バス運行状況マップ</font></a>
        <ul class="right hide-on-med-and-down">
          <li><router-link to="/">Top</router-link></li>
          <li><router-link to="/about">About</router-link></li>
          <li><router-link to="/contact">Contact</router-link></li>
      </ul>

      <ul id="nav-mobile" class="side-nav">
        <li><router-link to="/">Top</router-link></li>
        <li><router-link to="/about">About</router-link></li>
        <li><router-link to="/contact">Contact</router-link></li>
      </ul>
        <a href="#" data-activates="nav-mobile" class="button-collapse"><i class="material-icons">menu</i></a>
      </ul>
    </div>
  </nav>
</div>
</template>

<script>
  export default {
    mounted() {
      $(".button-collapse").sideNav();
      $('#nav-mobile').click(function(e) {
        $('#sidenav-overlay').trigger('click');
      });
    }
  }
</script>
