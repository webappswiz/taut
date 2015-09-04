# This .sh file will be sourced before starting your application.
# You can use it to put environment variables you want accessible
# to the server side of your app by using process.env.MY_VAR
#
# Example:
# export MONGO_URL="mongodb://localhost:27017/myapp-development"
# export ROOT_URL="http://localhost:3000"

export LC_ALL="en_US.UTF-8"

export APP_NAME="CrossBit"

export ROOT_URL="http://localhost:1337"
export PORT=1337

# Remote DB:
# export MONGO_URL=""
# Management:
# https://app.compose.io

# SMTP settings
# export MAIL_URL="smtp://postmaster%40sandboxb45ea6bb1d46474f9397d9cf90e1b45f.mailgun.org:307744cc69a2b85fe68339f362bbdb5d@smtp.mailgun.org:587"
export MAIL_URL="smtp://postmaster@webappsconsult.com:f941f5d8ca49d395aeb1a1ff993cbed3@smtp.mailgun.org:587"
# Management:
# https://mailgun.com/cp

stubborn
