var fs = require("fs");
var https = require("https");
var request = require("request");
//
// [1] Load SSL certificate and private key from files
//
var privateKey = fs.readFileSync("./keys/key.pem", "utf8");
var certificate = fs.readFileSync("./keys/cert.pem", "utf8");
var credentials = { key: privateKey, cert: certificate, passphrase:'password' };

var express = require("express");
var app = express();
//
// [2] Start a secure web server and listen on port 8443
//
var httpsServer = https.createServer(credentials, app);
console.log("Listening on port 8443...");
httpsServer.listen(8443);
//
// [3] Handle HTTPS GET requests at https://localhost:8443
//
app.get("/", function(req, res) {
  console.log("New request");

  let httpStatusCode = undefined;
  let httpErrorMsg = undefined;
  let oAuthCode = req.query.code; // get the OAuth 2.0 code from the request URL
  let oAuthReply = undefined;
  //
  // [4] POST request for obtaining OAuth 2.0 access token with code
  //
  var options = {
    url: "https://api.tdameritrade.com/v1/oauth2/token",
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    form: {
      grant_type: "authorization_code",
      access_type: "offline",
      code: oAuthCode,
      client_id: "BARRARD@AMER.OAUTHAP",
      redirect_uri: "https://localhost:8443"
    }
  };
  //
  // [5] Make POST request
  //
  request(options, function(error, response, body) {
    console.log({ error, response, body });
    httpStatusCode = response === undefined ? 0 : response.statusCode;
    httpErrorMsg = error;
    css = 'style="overflow-wrap: break-word; width: 800px;"';

    if (response.statusCode == 200) {
      oAuthReply = JSON.parse(body);
    }
    //
    // [6] Return view, showing the OAuth 2.0 code and access token
    //
    let html =
      '<html><body style="font-family: monospace;"><table>' +
      '<tr><td width="150">Status</td><td>' +
      httpStatusCode +
      "</td></tr>" +
      "<tr><td>OAuth 2.0 Code</td><td><div " +
      css +
      ">" +
      oAuthCode +
      "</div></td></tr>" +
      // "<tr><td>OAuth 2.0 Token</td><td><div " + css + ">" + oAuthReply.access_token + "</div></td></tr>" +
      "<tr><td>Full Response</td><td><div " +
      css +
      ">" +
      JSON.stringify(oAuthReply, null, 4) +
      "</div></td></tr>" +
      "</table></body></html>";

    res.send(html);
  });

  function errorHandler(err, req, res, next) {
    res.status(500);
    res.render("error", { error: err });
  }
});

/* encodeURIComponent('BARRARD@AMER.OAUTHAP')
"BARRARD%40AMER.OAUTHAP"
encodeURIComponent('https://localhost:8443')
"https%3A%2F%2Flocalhost%3A8443" */

//https://auth.tdameritrade.com/auth?response_type=code&redirect_uri=https%3A%2F%2Flocalhost%3A8443&client_id=BARRARD%40AMER.OAUTHAP

/* <REDIRECT_URI> = https://localhost:8443
<CLIENT_ID> = BARRARD@AMER.OAUTHAP */


// https://www.stefanbruhns.tech/td-ameritrade-apis/

/* { "access_token": "mlimCXVzgy8S/ZiznF/VkOmDMp/jYr1e+yVWjDfEbWGdeqc+dn7qO52Fud/0OzDZ2ZugOPOhjCtdxgKNYT8vx+mXtBogSJlqpJ9AqKpXJ6pOCXb6W7TLone6IbK/B8RvYQybiGQWLVAAh+q0rpiFAttaR41LVpWossFL8T3FopwAPF+UQx6sgPiUHqCRNlsFyDQEg7zV3bJxB+Jl5k2Zf7/fNo9oCw3EBggHW/VlQKF71tU9rtMDC0pmIs2fMwDKYn6U5gn4BC7+jqoBOR/zECD06IOz5b18otxiOMNZe9N/4Dnab9V0K9c3XUbd29urGK/zqqUC2j0iM3gZqxiIhpWctcxB+7dn4JzfQFtvJdjTcX54nepJE71mYptlSRKFBxCDoYiOpROotNx/7uBSakUoX3EDKsERf9CHXB8rBYllGsq7S9f5wD/J9dCEWp5mz+jgeyRXeX6Ue3qHMQWo13SX9vfOPiY4qPxo5KNnjTszijij8umkjYPDrO8dXBydSLFdb100MQuG4LYrgoVi/JHHvlaXJZTI40LtqZQguUVasomClr7JCfwKS9XKarqd03UWb7j4UOw4A+eLkHG6ubhB+B8RkA45TEqd2kDEX073QI1xse4/wRIQ0VdURnUWQ24NbSSUxzKep3V+iL8R4DtDHw38vn91GlwWUix8cBahMUEIFZDYn0GIpQXJbH/Ix7vjA35BnbBBjtAQWh4i4XJWq4qXJrQIHGnlhyn5bSIL4MCnCgY2o5LjA6uXZ3nKa5B7B2mfpAyB7QxQ5YcPtJrDT+ION67icv+BNEsSJw4dlmsy1D7r/Og7JpnOWLzQkS31HB7oCNX+M+Qwj54ImE9dO5f0mhC+vzm1/0un8iWYQll+VSq/gBo/q2EbUqXrd/rijMzQyrlO5rGxvKUp2+EKGXwvm1IxwcJQFcbmbLn9rZBmKAN92huhLL4aDzwIA2Jb9xG1UWHybGaxiSnCoyHvPTkzZckI/y39HmVkHHFUAT2EUtCGtSgRSjE/PW6Zsz3Jj9nhIcZ7zz1pwjq0HNpBis+GSlmJ212FD3x19z9sWBHDJACbC00B75E",
 "refresh_token": "xRJkpIUQbFAGZOjdjmwb2roR0uyBsjdSZmNgJy3TcabSxRpSyWjJTD4x88O3s/URSChc/K5gaH6oLhNl1V/Wlz7jKM3eaBewEVRk892AO7pPW6lNfVzREholHHyhAcpAGYCdBRHL+h0bo9I1nu++l0X9H/7ST2mCWOAJ65i/j2/mWRpd791EkGdf+xzR0Oy72F/NwUg4WTITkgx7gIjx/vZ7Z6T2xWSre+/WMDF0ZM+Cyjy4GajdTonrxhZZ2f1oNZBluQKxOAeA4nxJnjtqsI5f+G0DZEj22P6BbEevQ8HfPMrO7CobHltS6Fam7QseC6WNiUUwC2cVIT92mFXTM4pB6r1mRdzmhJ/K9RalrlbNdJ8ssj8qvzEr2qKftUsdZ0g2NOLB0wqPfqR61H0kC1yRprHgcfIHomBICVZ9N2OKL7rTeGQmzvZ5zfD100MQuG4LYrgoVi/JHHvlsvC1Sgn0BCmeWq738CxkwwVc59yHfR/5lwWTHQwJe5H177mfT7Vd6y08US0srrJKGs/rT6gVzFQ4M6uzsMK2tf59l7xwqJfYRl8ijdxgqkSQ/UR3TMW77/5JT1LuWZohCTYUBMUrXzoDta4nSsLYmNbjoXGol27muOAH356dYE+UraKtuzJ84LmAPii/2ciNLu4gAa1c1+iU+dYiolgBk+4/cqE/GBknt3yB83ei3X2DW7E1LsWl4lVB0oyddln6+fy2N+jQ9ZJgQD6m9kOOhbGeYyPeUrpzKfbZEs/qchAXrArNxuPqLTbQrfpBxazLNc5bPKFG8ZFsiuw1SRwyQi/myUq1Neiw8SYobeuuRwdWYnOJlOVSz69xpekEFlS1jE7CjBG6gRi/SbRzMWlu9L8XRv7KBgAV5FJDs34+kF9f6UsMLTfBbC0lqJg=212FD3x19z9sWBHDJACbC00B75E",
 "expires_in": 1800,
 "refresh_token_expires_in": 7776000, 
 "token_type": "Bearer" } */

/*  Oauth code

PX8QtZqTlCsMlKgHrwI8Z6s/Y+Jja8xLgeHeolSXEf6uWkaLEZATRby9UKQBw6iUAG8RV5WC4GFh4TnhL+NLIydiPfhh8Y7ysm/rFxVSONOlbjW+L61t2EoZicCfiXon6DeEjZqikAWIEqpVJ2qJqRiXl63HQN2aj4Fky7rB/JagfT4GNZBZEM1n0xp5M97EuZSuiJ+zPDONWuSCrtoWCnBpLMGKJr0meWaB6OAb92aSIbd3sZepGfg3j+9SZst2k325XCIWFG9rNH57MsuJb3IdDbps3v7RsXH60ZFgvOtuSwJY781v/ixf5IQ2cUPjJynRB1qxtGmveG3MaaO7ADI0QujxmByh4iejU1CvKDqPjmUF/pu7l7G0ZtlAOpqUZLojkFiLtSKHBUJzgPUOd1tFYPfb2Z2Nai0ee9zE+k7m5KXFwnlK2Zzk6o2100MQuG4LYrgoVi/JHHvlvw95xfHUMiABWgita8/fVOjqGMwKbMvOI1ufSkuy5R0OWmMa5oem6dyXasIrlugFmQhB5oUBUir4XoSqM5+glJYTFLw9YeCvIWNEbnAPn0LtOuCoSSGHIoHJm4zH1EJ7OF3G1zyvOw0gcUF0mazeijN8Ecs/08l/TL+bXOi4qc/2DQxhbYaVqnuBU2gKIyEJ0FnFpOm7+/ZTioCQoC4cOP6xXI4ZD3z2uJyyxYR+cMz6NvrbE7cpBrC4JSxoRGHR5Gdcl7Ykn2oweMRTvXynCIS+79eouInO1dq9B+jg5FWi7iWYkwOibtSGdsLvCYqYSN8AjMENAnUkRid6IJHhQbuOaOntKe0uG3DuvtbhmxCJXLTVnRqG0g5AAYtJipX4YtT3H9Pmsxxcek+A2ibcdq+OukOIMIB6R6bvrTHMNaUlzkofO5s5qJZrOVQ=212FD3x19z9sWBHDJACbC00B75E
*/

//may 2019 old maybe
// { "access_token": "EEripIE2lvp4IUur87UyQpoZoH3G3ytT96leYzA7oUka4KsnW5KO9XTtd04cCOnxg4KHdym6VrtmniLnZ2LVenZQYo69NpcnwmSsOEzNtbPkWyFasDgP5mdLMo9aPrivWrmF1tQM10HuOB/SLnsqLw+K9PpDGs5I/kg3GN7w0EkCe1xwW4I052C4jI6/IsFLOFrwYwZ9GsN6GUUdY8oB66lau1YiF/AUmGd47+FGBTY+mjI0o6tcK/d92uHLyfR3//pUdt83/suE4j4a4KKaF7mmxKK3sJuISG/jLeRWC8BY8KCaU5dBT9wUuH1ac74yRKqebC/6xEpL0wnt96lmGidKIcUxjlXiIK7tS5x10r+bkGHnAdh7hcy7TsglH56yJki4eKX2wsBd1v4Y1t+7+thZcqIiYdN7jMeLhz7getOcdOxUGz1UyrCAzZhmHsWGaWENLNgSJW5LgGGekLwBbbPO0BnUJDreiz0lCas2AiiLj76xNqs3pAQbkM3oZhbVDy6Eh100MQuG4LYrgoVi/JHHvl0p05ShFbCGmF821rWqgb08bHNrmL+QLaJ09SId5i/bD8wO4dqRxlE0Lq1DzjlGlQbd1deneXZWsuUXBdTNWItfh2+V7t9VH3CoYIv5rfAOJ+7rWNAuVkIPBBxsHy5GWUMh7buGAlXWAZc95FszcRpm5+8NhfdPDhQs8Dt7HuzW0scVUO37dMWNy6xRIz4kbLFprU0L5WtclCj44HveEOVlbxhp2h3iN3rOkhBxlbqDnEKX0jwr8puQi34wcEacaj64FD48PxzneL5WjJuHykV/uTlOSksfTJ7EmT9mp/Gnt1VvmW4qL60pNAGjlpCLjqMDtnKiqPE0lWAQFn/PmFXAqGVLTSXP3Adl1P8J/IMBqJOFaeCfVHCua5FipuP8kV+n96vodSdrxudvRbrgnox4VHveYFYBIVJ6j5bU+AyuCnUlAVno0Gpd4Al4k86WIS35MaPBhq9MYbC0RXoUOaHVaB0V8dJKvh99WezXclWc4aSyGrXTKn427icqS8ijAudlJ8KD212FD3x19z9sWBHDJACbC00B75E",
// "refresh_token": "jligpRUuPav8QFoc7rtnq+AJFaTTYpBZyGUYIqryQMjbgNHdf2lbdCL/uUYmrr3HZWuZ9v6lZurrNeTU9BLnx7ZBt7tP/e6UE0bJtTmEOiLcYlu56AwLWNg/aAVf05no+NIkww/UGJ56/BiXuMIMVy8744KsOjKy7KeKFv0SeolgOOwa+PT37QExJUTrp68A9dk31XLe7ioyv41tqoznwls58wH2tamAMsGFaOWHLrMsnjBQxYp5TU67iKXbOLtpxXObFZdBIbgjVKES6orbgfL2pK7n20WMpSI6IN3UB+gs4JmFtcn98DjKT/nl3b+oGYC+VsO62FXayCMW+d7A/lvVvGQXsZtVfqM2C2VJMa3b6hc0rHzKhz5P8zVb1t87/wdCnvTmc0SS6/tmNYo+Z7OIJnjGtTbIg9R7X/Q66nM8d4ofjVRKO5xE+pI100MQuG4LYrgoVi/JHHvl2qLqiyFfVnZVIH2aG9I8s5Ad5eBOXbWPkDy/tX0Dd+64cxQaj7V+CL+AojpeT7jHydQCqA/yAxGHYizyDnDSEv7ent4A2UqmRCu7LFM46MUTvSDfnatC7wU0DREg189sscBCH0HjqgPNe+VnG0TL2VaV08nrHXHtZF0lPvaHjgcpHRvYwqn/3ogWKSjwjrKvPSz2JSz6WeBzVRPpOPItJkX8IJSbWjxqQ48SAc0y02woIK2LrvI1argT1hRnRS5PNOVpX2Yj+fSx+a+wNk3reftjvLzr4nCuJIFnT2VFAxyXKrfD1WBfj/DpO/DTWnp22DEefGpgZz7g5RvTYg9i+KW/lAcmu6k14MSxd31vMmgSO7gxhZtZ13s4nyhBJE/Lt6RH+7i28Hl7xQRunVN4DyX2G/BmaxgAqEoCzaQAbznbbWjo7lvhLbYTFjo=212FD3x19z9sWBHDJACbC00B75E",
//  "expires_in": 1800,
//  "refresh_token_expires_in": 7776000,
//  "token_type": "Bearer" }



//6/23/19 - replace in 3 months 9-23-19
// { "access_token": "yhA/ePgE0jx+WYt8rFANlOrpfUr5bxO3SAy58S2eg7hQ/iCcvhidGUTmWtNsDMaDkfVTIiarT2zcuVqK6fJ5lVHibJPjVcZjY8NaTT0wNuG3BgwazTkBRDAor7OE2lSWbPWMOfi+1ZcwIHW2HC1n/Uuqv8lveXYOj5XkuTIYmISf6/YgH07qd4DHQS2t6YbsUX2oGhttrnRBWhGIlJU/9fMsGP7Qf4iU+HyVwip7iNy2kTngMJbA8gOptAKOPCUPc1gmcZI8/Hl8b16rvrZ7M0Q1jaie6CvfPDYjcHcnYX1uMe91mQ9WWrzLkwfjFTV2rJF6k+OQHqFX32Pv2bkwFvYVR3+K25T3w+GKAGl2Yk9CVxBPk1JbFrdYGGCqNPUTGgKmLU8vzUftx70IHx3f6u9A0nbMKwHnWthWt9VyHCCtW+WlwI8ADZgeaCv9Kx7kDjc5yJ/1XUtTgpENUiV9VQq9ZEx/a2x3jw4gw2DrAq+AiPGSELUqyW9pr9X6gVGGdHc56100MQuG4LYrgoVi/JHHvlft6VSToreiqs7LqddGAwL1G2imOWU2n6FTtl+E+49cbIo8HBki82Qptq+qvXtfyYsx93KNjjMu5xCw+zZjahKWgZFf62K5fO4H07PJAfHS1asND9l5fmWgC0OPYRrDazPikkzmYF05470QEdurs5/d+27zFaIsTxYEXCgpgME2YzTnna6/p0fbK6ooM+AUWt8kxOp9sPLelxMbHOcgQ293IxmmnLkLdR0lBdcSVLC0SFzoDzpnj2b6pjdXD1gTJnTbOk2nj+9vX2zFjbBz4+JX9lz0IzahhYZM1GJbWwEQCGJulQq830dV//sCcXKQBoSLIAVdlDgAvDl8jzs6+fZ0Qsy4fYqjR37lr859orf7ZaaplQ7s22AsiSmqqMNXlhvq50zgBLNApDLbv/5Y1f4JB1sySmSfe1ZlAQ4LNdUM0UbB0j1zM44Cfw5plYR3tL5Kuu5gfhV+K45PO+PIXr602d8IjKn0HrLULnkX8l1ZdE7EEsrCM4DpwyQ/jxmLOD+1QM98212FD3x19z9sWBHDJACbC00B75E",
//  "refresh_token": "Dz7n9Z5hgMoYCJx3fBnJrV8nYTyAUP6WVO/cq7IyH3sbVG4gXPQW98WNLRx2gADYlrsiC3k2k4buYegSsmLocfcPhVEAOFhW0kohQzNeME2BZzkGa4+S0zJ+UNef8nnPkjHTkVjU4M8VEDPLQ0Jt7BnFheE8m7HtLrOl6VhbY4OkVJUhmPske+uD0N5TnwTtDKlcd8dG4uVi5c8PBsInzdz40V7uTUpaMqTpk3o0weDYpa1/ZVzgTeytuqMJsc1Djug5d7KM/KYGHhIW8eNEQvCTMP47yyPN3Femm0p5UeRpa4IJIjkEYHE7++ZzOR/fy2QYViMw5owsGjtBjxt5sRrl1kbdI9mu+GdfJq97uNbRqd73H/hI5tYbhp52nSIJFbLDn0D15DI3EATjw84NmbPwSLQmijR0DWgdwYCIJeUskokDE4TUiE1KRYU100MQuG4LYrgoVi/JHHvl9vHKUIg6ErTxaBj3kM+sbyMRSdW279so8k9ukkodnsCwu+pEuwTFYZbuhJaiHqLWW7XyWdjZ1bccx1tKs7fsuinH7vLu8cBaWPTI2dkGWSq5rQ0W58kjypQUaM2Z0ygd5trci2EuGYUD00rweXA2tjv4wYufJhIbmB2BREq8cbXjPfubu92AkoIow7Y/c0jFwxh1BRp84Ox99tBGEiLtX1vCwXPV/w4sJlP/7SqnUY6re6+xCnekzm195dmpdpZ2+4On+bkA9YaEoZyFtUWOdMLtXYcUCdHREj1syF9pO8Jat0L5QOCUed5DHmUM1sdc+K299v3vnVF7qTmyqHI0akBPgqr4HnU2sp0HR1X23hWIlRtD/ziYVD9Q//0/A5TibCzGNangrCT3VRQns14qNWwVhPcWUzh9Zn1zdphSgvjMZ3j4kyl3ONB/3q8=212FD3x19z9sWBHDJACbC00B75E",
//  "expires_in": 1800,
//  "refresh_token_expires_in": 7776000,
//  "token_type": "Bearer" }