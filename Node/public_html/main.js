

function Validation() {
    var Email = document.getElementById("userEmail").value;
    var Password = document.getElementById("UserPassword").value;
  const emailRegex = /^[A-Za-z0-9._%+-]+@deakin\.edu\.au$/;

    var Validity = document.getElementById("warning");
    Validity.innerHTML = ""
  /*validate password*/
    if (Password === "") {
        Validity.classList.add("text-danger");
        Validity.classList.remove("text-success");
      Validity.innerHTML += "<strong> Password cannot be empty </strong>";
      return false
  }
  /*Validate email */
  if (Email === "") {
      Validity.classList.add("text-danger");
      Validity.classList.remove("text-success");
    Validity.innerHTML += "<strong> Email cannot be empty </strong>";
    return false

  }
  else if (!emailRegex.test(Email)) {
      Validity.classList.remove("text-success");
      Validity.classList.add("text-danger");

    Validity.innerHTML += "Enter a valid deakin email";
    return false


  }


  return true;
}

const addComment = async (Comment, writtenBy, CommentedOn) => {
  let Content = Comment.value;
  if (Content === "") {
    alert("please add comment before submitting.")  
  }
  else {
    try {
      const response = await fetch('/PostComment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Content, writtenBy, CommentedOn }),
      });

      if (response.ok) {
        console.log('Comment added successfully');
        Comment.value = "";
        location.reload();
      } else {
        console.error('Failed to add comment');
        // Handle error case, display an error message, or perform any other necessary actions
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error case, display an error message, or perform any other necessary actions
    }
  }
};

// function CallCreditsFunctionhere() {
//   // Implement your logic for the CallCreditsFunctionhere function
//   console.log('CallCreditsFunctionhere called');
// }