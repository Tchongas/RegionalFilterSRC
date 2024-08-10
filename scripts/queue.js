const HEADER = "https://www.speedrun.com/api/v1/";

      
      async function json_from_url_await(url) {
        let resp = await fetch(url);
        if (resp.ok)
          return resp.json();
        else
          throw resp.status;
      }

      async function json_from_src_await(short_url) {
        return await json_from_url_await(HEADER + short_url);
      }                

      async function continual_data_await_fast_reverse(short_url, limit) {
        if (limit % 200)
          throw "Limit must be a multiple of 200";
        if (limit > 10000)
          throw "Limit must be no greater than 10000";
        
        let hold = [];
        let holdD = {};
        let asc_hi;
        let desc_lo;

        async function next_await_fast_reverse(start, reverse) {
          let promises = [];
          let dir = reverse ? "desc" : "asc";
          for (let i = 0; i < limit; i += 200) {
            promises.push(json_from_src_await(
              short_url + (short_url.includes("?") ? "&" : "?") + `orderby=submitted&direction=${await dir}&max=200` +
              `&offset=${start * limit + i}`
            ).then(function(json) {hold.push(...json.data.map(free));
                    if (i == limit - 200 && json.data.length > 0) {
                      if (reverse) {desc_lo = json.data[json.data.length - 1].submitted;}
                      else {asc_hi = json.data[json.data.length - 1].submitted;}}}));
          }
          await Promise.all(promises);
          if ((asc_hi === undefined || desc_lo === undefined || asc_hi <= desc_lo) && hold.length == (start + 1) * limit + 10000 * reverse) {
            if (hold.length == 10000 && !reverse)
              await next_await_fast_reverse(0, true);
            else if (hold.length == 20000)
              throw -1;
            else
              await next_await_fast_reverse(start + 1, reverse);
          }
        }

        return await next_await_fast_reverse(0, false).then(function() {
                                                              for (let run of hold)
                                                                if (!(run.id in holdD)) {holdD[run.id] = run;}
                                                              return Object.values(holdD);
                                                            });
      }
      
      const CAT_FREE = ["links", "miscellaneous", "players", "rules", "type", "weblink"];
      const PLAYER_FREE = ["assets", "hitbox", "links", "pronouns", "signup", "speedrunslive", "supporterAnimation", "twitch", "twitter",
                           "weblink", "youtube"];
      const RUN_FREE = ["comment", "links", "splits", "status", "system"];
      
      function free(run) {
        for (let prop of CAT_FREE)
          delete run.category.data[prop];
        if (run.level.data.length !== 0) {
          for (let prop of CAT_FREE)
            delete run.level.data[prop];
        }
        for (let player of run.players.data) {
          for (let prop of PLAYER_FREE)
            delete player[prop];
        }
        for (let prop of RUN_FREE)
          delete run[prop];
        return run;
      }
      
      function player_vid_hash(run) {
        let rplayers = run.players.data.map(p => (p.rel == "user") ? p.names.international : p.name);
        rplayers.sort();
        let h = "$" + rplayers.join("|") + "$";
        if (run.videos === null)
          h += "NULL$";
        else {
          if ("text" in run.videos)
            h += run.videos.text + "$";
          if ("links" in run.videos) {
            let rvideos = run.videos.links.map(x => x.uri);
            rvideos.sort();
            h += rvideos.join("|") + "$";
          }
        }
        return h;
      }
      


      async function get_queue(abbr, startPoint, endPoint) {
        if (!startPoint) {
          startPoint = 0;
        }
        if (!endPoint) {
          endPoint = 100;
        }
        
        document.getElementsByTagName('tbody')[0].innerHTML = `<tr class="cursor-pointer x-focus-inner whitespace-nowrap" tabindex="0">
        <td class="sticky left-0 z-[4]">
          <a class="px-1.5 py-1" tabindex="-1" href="">
            <span class="inline-flex flex-nowrap items-center justify-start gap-1">
              <span>#</span>
            </span>
          </a>
        </td>
        <td class="cursor-pointer sticky z-[4] px-0.5 text-left" style="left:var(--cell-0-width)">
          <div class="whitespace-normal py-1">
            <span>
              <div class="inline-flex flex-row flex-wrap items-center justify-start">
                <div class="inline-flex min-w-0 items-center align-middle">
                  <a class="x-username x-username-popover x-focus-outline-offset" style="color:#edfafa;--username-gradient-from:#edfafa;--username-gradient-to:#edfafa" href="">
                    <span>Loading Queue</span>
                  </a>
                </div>
              </div>
            </span>
          </div>
        </td>
        <td class="text-secondary">
          <div class="flex flex-row flex-nowrap items-center justify-end gap-x-0.5 px-0.5 py-1">
            <button type="button" class="cursor-pointer" tabindex="-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" class="pointer-events-none w-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z">
      
                </path>
              </svg>
            </button>
          </div>
        </td>
        <td>
          <a class="px-1.5 py-1" tabindex="-1" href="">
            <span>
              <span>
                <span>
                  <span>For game: ${abbr}</span>
                </span>
              </span>
            </span>
          </a>
        </td>
        <td>
          <a class="px-1.5 py-1" tabindex="-1" href="">
            <span>Please Wait</span>
          </a>
        </td>
      </tr>`;
        try {
          var gameObj = await json_from_src_await(`games/${abbr}`);
        }
        catch (code) {
          let errorMsg;
          if (code == 404) {
            errorMsg = `Invalid game: ${escape(abbr)}`;
          } else if (code >= 400) {
            errorMsg = `Speedrun.com server error (${code})`;
          } else {
            errorMsg = "Unknown error";
          }
          
          return;
        }
        gameID = gameObj.data.id;
        gameName = gameObj.data.names.international;
        try {
          queue = await continual_data_await_fast_reverse(`runs?game=${await gameID}&status=new&embed=category,level,players`, 5000);
        }
        catch (code) {
          let errorMsg;
          if (code >= 400) {
            errorMsg = `Speedrun.com server error (${code})`;
          } else if (code == -1) {
            errorMsg = `Queue for ${gameName} has more than 20000 runs. Could not fetch the entire queue.`;
          } else {
            errorMsg = "Unknown error";
          }
          
          return;
        }
        queue.sort((a, b) => ((a.submitted != b.submitted) ? ((a.submitted > b.submitted) - 0.5) : 0));
        queue.sort((a, b) => ((a.date != b.date) ? ((a.date > b.date) - 0.5) : 0));
        working_queue = queue;
        try {
          var varObj = await json_from_src_await(`games/${gameID}/variables`);
        }
        catch (code) {
          let errorMsg;
          if (code >= 400) {
            errorMsg = `Speedrun.com server error (${code})`;
          } else {
            errorMsg = "Unknown error";
          }
          
          return;
        }
        var_map = {};
        subcat_map = {};
        for (let variable of varObj.data) {
          var_map[variable.id] = variable.name;
          for (let value in variable.values.values) {
            var_map[value] = variable.values.values[value].label;
            if (variable["is-subcategory"])
              subcat_map[value] = variable.values.values[value].label;
          }
        }
        let all_cats = [];
        for (let run of queue) {
          let full_cat = full_category(run);
          if (!all_cats.includes(full_cat))
            all_cats.push(full_cat);
        }
        all_cats.sort((a, b) => ((a > b) - 0.5));
        all_cats.unshift("All Categories");
        let cat_select = `<select name="category-select" id="category-select" >`;
        for (let cat of all_cats)
          cat_select += `<option value="${cat}">${cat}</option>`;
        cat_select += `</select> <button onclick="edit_working_queue()" >Apply</button>`;

        //document.getElementById("category-error").innerHTML = cat_select;
        edit_working_queue(startPoint,endPoint);
      }

      function full_category(run) {
        let subcatvals = [];
        for (let value of Object.values(run.values)) {
          if (value in subcat_map)
            subcatvals.push(subcat_map[value]);
        }
        let main;
        if (run.level.data.length === 0)
          main = run.category.data.name;
        else {
          main = run.level.data.name;
          subcatvals.unshift(run.category.data.name);
        }
        return ((subcatvals.length > 0) ? `${main} - ${subcatvals.join(", ")}` : main);
      }

      function players(run) {
        return run.players.data.map(get_display_name).join("<br>");
      }

      function str_time(time) {
        let milli = Math.round(time * 1000);
        let hours = (Math.floor(milli / 3600000)).toString();
        let minutes = (Math.floor((milli % 3600000) / 60000)).toString();
        let seconds = (Math.floor((milli % 60000) / 1000)).toString();
        let milliseconds = (milli % 1000).toString();
        if (hours != "0") {
          if (milliseconds != "0")
            return `${hours}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}.${milliseconds.padStart(3, "0")}`;
          else
            return `${hours}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`
        } else if (minutes != "0") {
          if (milliseconds != "0")
            return `${minutes}:${seconds.padStart(2, "0")}.${milliseconds.padStart(3, "0")}`;
          else
            return `${minutes}:${seconds.padStart(2, "0")}`;
        } else if (seconds != "0") {
          if (milliseconds != "0")
            return `${seconds}.${milliseconds.padStart(3, "0")}`;
          else
            return `0:${seconds.padStart(2, "0")}`;
        } else
          return `0.${milliseconds.padStart(3, "0")}`;
      }

      function primary_time(run) {
        return str_time(run.times.primary_t);
      }

      function edit_working_queue(startPoint,endPoint) {
        startPoint = parseInt(startPoint)
        endPoint = parseInt(endPoint)

        selected = "All Categories"

        let title;
        if (selected == "All Categories") {
          working_queue = [...Array(queue.length).keys()];
          title = `<b>${gameName}\n${working_queue.length} run${(working_queue.length != 1) ? "s" : ""}`;
        } else {
          working_queue = [];
          let i = 0;
          for (let run of queue) {
            if (full_category(run) == selected)
              working_queue.push(i);
            i++;
          }
          title = `<b>${gameName}\n${selected}\n${working_queue.length} run${(working_queue.length != 1) ? "s" : ""}`;
        }
        title += "</b>";
        let output = "";
        for (let index = startPoint; index <= endPoint; index++) {
          let run = queue[index];
          document.getElementsByTagName('tbody')[0].innerHTML = output;

          if (index == endPoint) {
            output += `<tr class="cursor-pointer x-focus-inner whitespace-nowrap" tabindex="0">
            <td class="sticky left-0 z-[4]">
              <a class="px-1.5 py-1" tabindex="-1" href="">
                <span class="inline-flex flex-nowrap items-center justify-start gap-1">
                  <span>X</span>
                </span>
              </a>
            </td>
            <td class="cursor-pointer sticky z-[4] px-0.5 text-left" style="left:var(--cell-0-width)">
              <div class="whitespace-normal py-1">
                <span>
                  <div class="inline-flex flex-row flex-wrap items-center justify-start">
                    <div class="inline-flex min-w-0 items-center align-middle">
                      <a class="x-username x-username-popover x-focus-outline-offset" style="color:#ff5454;--username-gradient-from:#ff5454;--username-gradient-to:#ff5454" href="">
                        <span>END REACHED</span>
                      </a>
                    </div>
                  </div>
                </span>
              </div>
            </td>
            <td class="text-secondary">
              <div class="flex flex-row flex-nowrap items-center justify-end gap-x-0.5 px-0.5 py-1">
                <button type="button" class="cursor-pointer" tabindex="-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" class="pointer-events-none w-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z">
          
                    </path>
                  </svg>
                </button>
              </div>
            </td>
            <td>
              <a class="px-1.5 py-1" tabindex="-1" href="">
                <span>
                  <span>
                    <span>
                      <span>Open the popup for more</span>
                    </span>
                  </span>
                </span>
              </a>
            </td>
            <td>
              <a class="px-1.5 py-1" tabindex="-1" href="">
                <span></span>
              </a>
            </td>
          </tr>`;
            document.getElementsByTagName('tbody')[0].innerHTML = output;
            output = ``;
            return
          } 

          output += `<tr class="cursor-pointer x-focus-inner whitespace-nowrap" tabindex="0">
          <td class="sticky left-0 z-[4]">
            <a class="px-1.5 py-1" tabindex="-1" href="${run.weblink.replace("http://", "https://")}">
              <span class="inline-flex flex-nowrap items-center justify-start gap-1">
                <span>${index}</span>
              </span>
            </a>
          </td>
          <td class="cursor-pointer sticky z-[4] px-0.5 text-left" style="left:var(--cell-0-width)">
            <div class="whitespace-normal py-1">
              <span>
                <div class="inline-flex flex-row flex-wrap items-center justify-start">
                  <div class="inline-flex min-w-0 items-center align-middle">
                    <a class="x-username x-username-popover x-focus-outline-offset" style="color:#ff5454;--username-gradient-from:#ff5454;--username-gradient-to:#ff5454" href="${run.weblink.replace("http://", "https://")}">
                      <span>${players(run)}</span>
                    </a>
                  </div>
                </div>
              </span>
            </div>
          </td>
          <td class="text-secondary">
            <div class="flex flex-row flex-nowrap items-center justify-end gap-x-0.5 px-0.5 py-1">
              <button type="button" class="cursor-pointer" tabindex="-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" class="pointer-events-none w-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z">
        
                  </path>
                </svg>
              </button>
            </div>
          </td>
          <td>
            <a class="px-1.5 py-1" tabindex="-1" href="${run.weblink.replace("http://", "https://")}">
              <span>
                <span>
                  <span>
                    <span>${primary_time(run)} // ${run.date}</span>
                  </span>
                </span>
              </span>
            </a>
          </td>
          <td>
            <a class="px-1.5 py-1" tabindex="-1" href="${run.weblink.replace("http://", "https://")}">
              <span>${full_category(run)}</span>
            </a>
          </td>
        </tr>`;
                          
                    
        }

        
         document.getElementsByTagName('tbody')[0].innerHTML = output;
        
      }
      
      const COLOR_MAP = {"#EE2222": "#E44141",  // red
                         "#E77471": "#C86462",  // coral
                         "#EF8239": "#D37339",  // orange
                         "#DAA520": "#B4902E",  // yellow
                         "#7AB941": "#70A342",  // green
                         "#009856": "#08AB6E",  // mint
                         "#249BCE": "#389BC6",  // azure
                         "#4646CE": "#6666EE",  // blue
                         "#900090": "#A010A0",  // purple
                         "#A259C5": "#AE6CCD",  // lavender
                         "#E762B5": "#C75C9F",  // pink
                         "#EF2081": "#EE2D88",  // fuchsia
                         "#FFB3F3": "#AF7BA7",  // light pink
                         "#808080": "#999999",  // silver
                         "#000000": "#999999"}; // white

      function hex(num) {
        return Math.round(Math.max(0, Math.min(255, num))).toString(16);
      }

      function splitRGB(rgb) {
        return rgb.match(/.{1,2}/g).map(x => parseInt(x, 16));
      }

      function joinRGB(rgb) {
        return rgb.map(x => hex(x).padStart(2, "0")).join("");
      }

      function gradient(start, end, len) {
        let colors = [];
        let splitStart = splitRGB(start);
        let splitEnd = splitRGB(end);
        for (let i = 0; i < len; i++) {
          let weight = (len == 1) ? 0 : (i / (len - 1));
          colors.push(joinRGB(splitStart.map((e, i) => (e * (1 - weight) + splitEnd[i] * weight))));
        }
        return colors;
      }
      
      function escape(str) {
        if (str === null)
          return "null";
        else if (str === undefined)
          return "undefined";
        else
          return str.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
      }
      
      function get_display_name(user, flag=true, link=false) {
        if (!("rel" in user) || user.rel == "user") {
          let name_style = user["name-style"];
          let user_name = user.names.international;
          let user_loc = user.location;
          
          if (name_style.style == "gradient") {
            
            let startD = name_style["color-from"].dark;
            let endD = name_style["color-to"].dark;
            let name_gradientD = gradient(startD.slice(1), endD.slice(1), user_name.length);
            var display_name = `<span>` +
                                 name_gradientD.map((c, i) => `<span style="color:#${c}">${escape(user_name[i])}</span>`).join("") +
                               `</span>`;
          } else if (name_style.style == "solid") {
            
            let colorL = name_style.color.light;
            let colorD = name_style.color.dark;
            var display_name = `<span class="xlight ">` + escape(user_name) + `</span>` + `<span class="xdark">` +`</span>`;
          }

          display_name = `<b>${display_name}</b>`;
          if ((user_loc !== null) && ("country" in user_loc)) {
            
            
            display_name = `<span style="white-space:nowrap">`+
                             display_name +
                           `</span>`;
          }
          return display_name;
        }
      }
