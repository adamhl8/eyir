module.exports = {
  apps : [{
    name: 'eyir',
    script: 'dist/eyir.js',
    args: '.env',
    instances: 1,
    autorestart: true,
    watch: false,
    exec_mode: "fork",
    log_date_format: "[[]YYYY-MM-DD [at] HH:mm:ss]",
    combine_logs: true,
    error_file: "logs/errors.log",
    out_file: "logs/eyir.log"
  },
  {
    name: 'eyir-test',
    script: 'dist/eyir.js',
    args: '.env-test',
    instances: 1,
    autorestart: true,
    watch: false,
    exec_mode: "fork",
    log_date_format: "[[]YYYY-MM-DD [at] HH:mm:ss]",
    combine_logs: true,
    error_file: "logs/test-errors.log",
    out_file: "logs/eyir-test.log"
  }]
};
