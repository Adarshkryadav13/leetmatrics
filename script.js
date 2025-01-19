document.addEventListener("DOMContentLoaded", function(){
    const searchButton=document.getElementById("search-btn");
    
     const usernameInput=document.getElementById("user-input");
    const statscointainer=document.querySelector(".stats-cointainer");
    const easyprogressCircle=document.querySelector(".easy-progress");
    const mediumprogressCircle=document.querySelector(".medium-progress");
    const hardprogressCircle=document.querySelector(".hard-progress");
    const easyLevel=document.getElementById("easy-level");
    const mediumLevel=document.getElementById("medium-level");
    const hardLevel=document.getElementById("hard-level");
    
    const cardstatscointainer=document.querySelector(".stats-card");

//return true or false based on regex
function validateUsername(username){
    if(username.trim()===""){
        alert("username should not be empty");
        return false;
    }
    const regex = /^[a-zA-z0-9_-]{1,15}$/;
    const isMatching=regex.test(username);
    if(!isMatching){
        alert("username invalid");
    }
    return isMatching;
}

async function fetchUserDetails(username) {
    try{
        searchButton.textContent = "Searching...";
        searchButton.disabled = true;
        //statsContainer.classList.add("hidden");
        // const response = await fetch(url);
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/' 
        const targetUrl = 'https://leetcode.com/graphql/';
        
        const myHeaders = new Headers();
        myHeaders.append("content-type", "application/json");
        const graphql = JSON.stringify({
            query: "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n    ",
            variables: { "username": `${username}` }
        })
        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: graphql,
        };
        const response = await fetch(proxyUrl+targetUrl, requestOptions);
        if(!response.ok) {
            throw new Error("Unable to fetch the User details");
        }
       
        const parsedData = await response.json();
        console.log("logging data:",parsedData);
        displayUserData(parsedData);
    }
    catch(error) {
        statscointainer.innerHTML = `<p>${error.message}</p>`
    }
    finally {
        searchButton.textContent = "Search";
        searchButton.disabled = false;
    }
}

function updateProgress(solved, total, level, circle) {
    const progressDegree = (solved/total)*100;
    circle.style.setProperty("--progress-degree", `${progressDegree}%`);
    level.textContent = `${solved}/${total}`;
}


function displayUserData(parsedData) {
    if (!parsedData.data) {
        statscointainer.innerHTML = `<p>Invalid response from the server.</p>`;
        return;
    }

    const allQuestionCount = parsedData.data.allQuestionsCount || [];
    const matchedUser = parsedData.data.matchedUser;

    if (!Array.isArray(allQuestionCount) || allQuestionCount.length < 4) {
        statscointainer.innerHTML = `<p>Invalid or incomplete question data.</p>`;
        return;
    }

    if (!matchedUser || !matchedUser.submitStats || !Array.isArray(matchedUser.submitStats.acSubmissionNum)) {
        statscointainer.innerHTML = `<p>User data not found or incomplete.</p>`;
        return;
    }

    // Extract data safely with fallback values
    const totalQues = allQuestionCount[0]?.count || 0;
    const totalEasyQues = allQuestionCount[1]?.count || 0;
    const totalMediumQues = allQuestionCount[2]?.count || 0;
    const totalHardQues = allQuestionCount[3]?.count || 0;

    const solvedTotalQues = matchedUser.submitStats.acSubmissionNum[0]?.count || 0;
    const solvedTotalEasyQues = matchedUser.submitStats.acSubmissionNum[1]?.count || 0;
    const solvedTotalMediumQues = matchedUser.submitStats.acSubmissionNum[2]?.count || 0;
    const solvedTotalHardQues = matchedUser.submitStats.acSubmissionNum[3]?.count || 0;

    updateProgress(solvedTotalEasyQues, totalEasyQues, easyLevel, easyprogressCircle);
    updateProgress(solvedTotalMediumQues, totalMediumQues, mediumLevel, mediumprogressCircle);
    updateProgress(solvedTotalHardQues, totalHardQues, hardLevel, hardprogressCircle);

    const cardsData = [
        {label: "Overall Submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions },
        {label: "Overall Easy Submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions },
        {label: "Overall Medium Submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions },
        {label: "Overall Hard Submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions },
    ];
    console.log("card ka data: " , cardsData);
    cardstatscointainer.innerHTML = cardsData.map(
        data => 
                `<div class="card">
                <h4>${data.label}</h4>
                <p>${data.value}</p>
                </div>`
    ).join("")
}







    searchButton.addEventListener('click',function(){
        
        username=usernameInput.value;
        console.log("logging user name:",username)
        if(validateUsername(username)){
            fetchUserDetails(username);
        }
    })
    
});


 