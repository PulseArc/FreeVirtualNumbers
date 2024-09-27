$(document).ready(function () {
  $(document).on("click", ".go_to", function () {
    var scroll_el = $(this).attr("href");
    if ($(scroll_el).length != 0) {
      $("html, body").animate({ scrollTop: $(scroll_el).offset().top }, 900);
    }
    return false;
  });

  /*---------------------------------------------------end*/
  $(document).on("click", ".dropdown-btn", function () {
    let el = $(this);
    if (!el.closest(".activity-list").length) {
      $(this).toggleClass("active");
      $(this).parent(".dropdown").toggleClass("active");
      $(this).next(".dropdown-content").slideToggle();
    }
  });

  /*---------------------------------------------------end*/

  $(".dropheight-btn").click(function () {
    contParent = $(this).parent(".dropheight");
    if ($(this).hasClass("active")) {
      $(this).text("Показать");
      $(this).removeClass("active");
      $(contParent).animate({ height: 250 }, 500);
    } else {
      $(this).text("Скрыть");
      $(this).addClass("active");
      $(contParent).animate({ height: $(contParent)[0].scrollHeight }, 500);
    }
  });

  /*---------------------------------------------------end*/

  new ClipboardJS(".cp");

  $(document).on("click", ".cp", function () {
    $(this).prepend('<span class="cp-success">СМС скопировано (Copied)</span>');
    $(document).find(".cp-success").fadeIn(500);
    setTimeout(function () {
      $(document).find(".cp-success").remove();
    }, 1500);
  });

  /*---------------------------------------------------end*/

  $(function () {
    function showModal(id) {
      $(id).fadeIn(300);
    }

    function hideModals() {
      $(document.body).removeClass("is-open-modal");
      $(".modal").fadeOut();
      $(".header").removeClass("fixed");
      $("body").css("overflow", "auto");
    }
    $(document).on("click", ".modal-info", function (e) {
      showModal("#modal-info");
    });
    $(document).on("click", ".modal-form", function (e) {
      e.preventDefault();
      showModal("#modal-form");
    });
    $(document).on("click", ".modal-login", function (e) {
      e.preventDefault();
      location.href = "https://sms-activation-service.com/ru/login/?ch-free-ru";
    });
    $(document).on("click", ".modal-register", function (e) {
      e.preventDefault();
      location.href =
        "https://sms-activation-service.com/ru/register/?ch-free-ru";
    });
    $(document).on("click", ".btn-menu", function () {
      showModal("#modal-menu");
      $(".header").addClass("fixed");
      $("body").css("overflow", "hidden");
    });
    $(document).on("click", ".modal-close", function () {
      hideModals();
    });
    $(document).on("click", function (e) {
      if (
        !(
          $(e.target).parents(".modal-content").length ||
          $(e.target).hasClass("modal-content") ||
          $(e.target).hasClass("btn-menu") ||
          $(e.target).hasClass("modal-close") ||
          $(e.target).hasClass("modal-form") ||
          $(e.target).hasClass("modal-login") ||
          $(e.target).hasClass("modal-register") ||
          $(e.target).hasClass("modal-info")
        )
      ) {
        hideModals();
      }
    });
  });
});

/*---------------------------------------------------end*/

window.freeLoading = false;
window.messageListPage = 2;
window.updateRecaptcha = (key, id) => {
  grecaptcha.ready(function () {
    grecaptcha.execute(key, { action: "login" }).then(function (token) {
      var recaptchaResponse = document.getElementById(id);
      recaptchaResponse.value = token;
    });
  });
};

var lang = window.location.href.substr(-3, 2);

function getFreeMessages(countryCodeApi, number, page, lang = "ru") {
  if (!freeLoading) {
    freeLoading = true;
    if (page <= 1) {
      $(document)
        .find("#messages-list")
        .html(
          '<div class="center-block center-block-preloader"><div class="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>',
        );
    } else {
      $(document)
        .find("#messages-list")
        .append(
          '<div class="center-block center-block-preloader"><div class="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>',
        );
    }

    let messagesList = $(document).find("#messages-list");

    let lang = window.location.href.substr(-3, 2);

    if (lang == "rs") {
      lang = "ru";
    }

    window.axios
      .get("/api/getMessageList/", {
        params: {
          countryCodeApi: countryCodeApi,
          number: number,
          page: page,
          lang: lang,
        },
      })
      .then(function (response) {
        if (response.data.status) {
          if (page <= 1) {
            messagesList.replaceWith($.parseHTML(response.data.html));

            $('[data-action="scroll"]').on(
              "scroll",
              getFreeMessagesScrollHandler,
            );
          } else {
            let wrapper = messagesList.find(".wrapper");

            wrapper.append($.parseHTML(response.data.html));
            messagesList.find(".center-block").remove();
            messageListPage = response.data.current_page + 1;

            if (response.data.current_page >= response.data.last_page) {
              $(document).find('[data-action="scroll"]').off("scroll");
            }
          }
        }

        freeLoading = false;
      })
      .catch(function (error) {
        messagesList.find(".center-block").remove();
        freeLoading = false;
      });
  }
}

function getFreeMessagesScrollHandler() {
  if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
    let el = $(this);
    let parent = el.closest("#messages-list");
    let countryCodeApi = parent.data("country-code-api");
    let number = parent.data("number");
    getFreeMessages(countryCodeApi, number, messageListPage);
  }
}

$(document).ready(function () {
  $('[data-action="scroll"]').on("scroll", getFreeMessagesScrollHandler);

  $("#activity .dropdown-btn").on("click", function () {
    if (!freeLoading) {
      freeLoading = true;
      let button = $(this);
      let parent = button.closest(".dropdown");
      let countryId = parent.data("country-id");
      let countryCodeApi = parent.data("country-code-api");

      parent
        .find(".dropdown-content")
        .html(
          '<div class="center-block"><div class="lds-facebook"><div></div><div></div><div></div></div></div>',
        );

      let dropdowns = $(document)
        .find("#activity .dropdown")
        .each(function () {
          let el = $(this);
          let btn = el.find(".dropdown-btn");
          let content = el.find(".dropdown-content");

          el.removeClass("active");
          btn.removeClass("active");
          content.removeAttr("style");
          if (content.find(".center-block").length === 0) {
            content.html("");
          }
        });

      button.toggleClass("active");
      button.parent(".dropdown").toggleClass("active");
      button.next(".dropdown-content").slideToggle();

      const loader = ($el) => {
        const flag = $el.find(".js-numbers-flag");
        const loader = $el.find(".js-numbers-loader");

        return {
          show() {
            flag.addClass("is-hide");
            loader.removeClass("is-hide");
          },
          hide() {
            flag.removeClass("is-hide");
            loader.addClass("is-hide");
          },
        };
      };

      loader($(this)).show();

      window.axios
        .get("/api/getPhoneList/", {
          params: {
            countryId: countryId,
            countryCodeApi: countryCodeApi,
            lang: lang,
          },
        })
        .then(function (response) {
          if (response.data.status) {
            parent
              .find(".dropdown-content")
              .html($.parseHTML(response.data.html));
          }
          freeLoading = false;
        })
        .catch(function () {
          freeLoading = false;
        })
        .finally(() => {
          loader($(this)).hide();
        });
    }
  });

  $(document).on("click", "[data-action=select-number]", function (e) {
    e.preventDefault();

    $(".btn-num").css({ color: "#2B2B2C" });

    let button = $(this);
    button.css({ color: "green" });
    let parent = button.closest(".dropdown");
    let countryCodeApi = parent.data("country-code-api");
    let number = button.data("number");
    let page = 1;

    messageListPage = 2;
    getFreeMessages(countryCodeApi, number, page);
    // TODO:: scroll to
    $("html, body").animate(
      {
        scrollTop: $("#messages-list").offset().top,
      },
      300,
    );
  });

  $(document).on(
    "click",
    '#activity [data-action="refresh-messages-list"]',
    function (e) {
      e.preventDefault();

      let button = $(this);
      let parent = button.closest("#messages-list");
      let countryCodeApi = parent.data("country-code-api");
      let number = parent.data("number");
      let page = 1;

      messageListPage = 2;
      getFreeMessages(countryCodeApi, number, page);
    },
  );

  $(document).on("submit", '[data-widget="sendForm"]', async function (e) {
    e.preventDefault();

    let form = $(this);
    let formName = form.data("name");

    try {
      let formAction = form.attr("action");
      let formMethod = form.attr("method");
      let formData = form.serializeArray();

      if (formName === "register" || formName === "fast-register") {
        formData.push({ name: "name", value: "Freenumb" });
        formData.push({
          name: "password_confirmation",
          value: formData.find((x) => x.name === "password").value,
        });
      }

      form.find(".invalid-feedback").html("");
      form.find(".form-control").removeClass("is-invalid");

      const response = await window.axios({
        method: formMethod,
        url: formAction,
        data: $.param(formData),
        responseType: "json",
      });

      if (typeof response.data.status !== "undefined" && response.data.status) {
      } else if (
        typeof response.data.status !== "undefined" &&
        !response.data.status
      ) {
      } else {
        alert("Ошибка!");
      }

      if (typeof response.data.reload !== "undefined" && response.data.reload) {
        window.location.reload();
      }

      if (form.find("#recaptchaResponse").length) {
        window.updateRecaptcha(window.grecaptchaKey, "recaptchaResponse");
      }
    } catch (error) {
      if (
        typeof error.response.data.errors !== "undefined" &&
        error.response.data.errors
      ) {
        $.each(error.response.data.errors, function (index, value) {
          form.find(`#${index}-${formName}`).addClass("is-invalid");
          form
            .find(`#${index}-${formName}-error`)
            .append(`<strong>${value}</strong>`);
        });
      } else {
        alert("Ошибка!");
      }

      if (form.find("#recaptchaResponse").length) {
        window.updateRecaptcha(window.grecaptchaKey, "recaptchaResponse");
      }
    }
  });
});
