Swal.fire({
  html: `${chatName}! `,
  toast: true,
  position: 'center',
  icon: 'question',
  input: 'email',
  inputValue: emailUser,
  showCancelButton: false,
  showConfirmButton: true,
  inputValidator: (value) => {
    if (!emailUser) {
      return 'Please enter your e-mail';
    } else if (
      !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(value.trim())
    ) {
      return 'Please enter a valid e-mail';
    }
  },
}).then((result) => {
  user = result.value;
  document.getElementById('username').innerHTML = user;
  socket = io({
    query: {
      user,
    },
  });

  socket.on('newUser', (user) => {
    if (user !== socket.id) {
      Swal.fire({
        html: `${user} has been connected`,
        toast: true,
        position: 'top-right',
        icon: 'question',
        timer: 10000,
        timerProgressBar: true,
      });
    }
  });

  chatBox.addEventListener('keyup', (evt) => {
    if (evt.key === 'Enter') {
      if (chatBox.value.trim().length > 0) {
        socket.emit('message', {
          user,
          message: chatBox.value,
        });
      }
      chatBox.value = '';
    }
  });

  socket.on('history', (data) => {
    let history = document.getElementById('history');
    let messages = '';
    data.reverse().forEach((item) => {
      messages += `<p>[<i>${item.user}</i>] say: ${item.message}<br />`;
    });
    history.innerHTML = messages;
  });
});
