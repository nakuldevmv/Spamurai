function GetUser() {
    return (
        <>
            <label>E-mail</label><input type="text" />
            <br />
            <label>App Password</label><input type="text" />
            <br />
            <button type="submit">Start</button>
            <u> <p>After Scaning</p> </u>
            <label>Move E-mails to Trash</label><input type="radio" name="" id="" />
            <br />
            <label>Permenently Delete The E-mails</label><input type="radio" name="" id="" />


        </>
    )

}
export default GetUser;