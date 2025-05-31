<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="copyright">
        Copyright © 2025 Momentum Pro. All rights reserved.
      </div>
      <div class="contact-info">
        <span>Contact: <a href="mailto:support@momentumpro.com">support@momentumpro.com</a></span>
        <span>Phone: (555) 123-4567</span>
        <span><a href="https://momentum-pro.netlify.app" target="_blank">momentum-pro.netlify.app</a></span>
      </div>
    </div>
  </footer>
</template>

<script setup>
// No additional script needed for this simple component
</script>

<style scoped>
.app-footer {
  background-color: #f5f5f5;
  padding: 1rem;
  margin-top: 2rem;
  border-top: 1px solid #e0e0e0;
  font-size: 0.85rem;
  color: #666;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
}

.contact-info {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

a {
  color: #4a6cf7;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

@media (min-width: 768px) {
  .footer-content {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
}
</style>