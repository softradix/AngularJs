$(document).ready(function () {
  $("body").tooltip({
    selector: "[data-toggle=tooltip]",
  });

  $(document).on("click", ".download-pdf, .broker-info-pdf", function () {
    console.log("Working");
    $(".pdf-page, .broker-info").printThis({
      importCSS: true,
      header: null,
      footer: null,
      removeInline: false,
      printContainer: false,
    });
  });

  $(document).on("click", ".side-open", function () {
    $("aside").toggleClass("show");
  });

  $(document).on(
    "click",
    ".list-pop-up .btn-link, .drag-drop .btn-link",
    function () {
      $(".list-pop-up").slideToggle("show");
    }
  );

  $(document).on(
    "click",
    ".especialidade .btn, .profess .btn, .tipo-btn .btn, .product, .specilaity, .liability-btn, .franquia-btn",
    function () {
      $(this).toggleClass("active");
    }
  );

  $(document).on("click", ".pop-up .next-btn", function () {
    $(this).parent().parent().parent().parent().hide();
    $(this).parent().parent().parent().parent().next(".pop-up").show();
  });

  $(document).on("click", ".pop-up .close-all", function () {
    $(".pop-up-overlay").hide();
  });

  $(document).on("click", ".pop-up .backbtn", function () {
    $(this).parent().parent().parent().parent().hide();
    $(this).parent().parent().parent().parent().prev(".pop-up").show();
  });

  $(document).on("click", ".product,.tipo-btn, .profession", function () {
    $(this).parents(".toggle-btn-area").next("div").slideDown();
  });

  $(document).on("click", ".specilaity, .liability-btn", function () {
    $(this).parent().parent().parent().parent().next("div").slideDown();
  });

  $(document).on("click", ".product-item:not(:last-child)", function () {
    $(this).siblings().removeClass("active");
    $(this).addClass("active");
    $(".products-page .nav").show();
  });

  $(document).on("click", ".btn-primary.popup-btn", function () {
    $(this).parent().parent().hide();
    $(this).parent().parent().next().show();
  });

  $(document).on("click", ".btn-outline-primary.popup-btn", function () {
    $(this).parent().parent().hide();
    $(this).parent().parent().prev().show();
  });

  $(document).on("click", ".close-btn", function () {
    $(".second-pop-up-step,.third-pop-up-step").hide();
    $(".first-pop-up-step").show();
  });

  $(document).on("click", ".proposal-payment-options", function () {
    $(this).addClass("active");
    $(this).siblings().removeClass("active");
  });

  $(document).on(
    "click",
    "#rc-professional-modal .btn:not(.popup-btn)",
    function () {
      $(this).addClass("active");
      $(this).siblings().removeClass("active");
    }
  );

  $(document).on(
    "click",
    ".pop-up-overlay .modal-dialog .btn-primary",
    function () {
      if ($(".content:nth-child(4)").hasClass("active")) {
        $(".pop-up-overlay").hide();
      }
      $(".content.active").removeClass("active").next().addClass("active");
      $(".modal-sidebar li.active")
        .removeClass("active")
        .next()
        .addClass("active");
      $(this).prev().show();
      $(".form-check").show();
      if ($(".content:nth-child(1)").hasClass("active")) {
        $(this).prev().hide();
        $(".form-check").hide();
      }
    }
  );

  $(document).on(
    "click",
    ".pop-up-overlay .modal-dialog .btn-outline-primary",
    function () {
      $(".content.active").removeClass("active").prev().addClass("active");
      $(".modal-sidebar li.active")
        .removeClass("active")
        .prev()
        .addClass("active");
      if ($(".content:nth-child(1)").hasClass("active")) {
        $(this).hide();
        $(".form-check").hide();
      }
    }
  );
});

// $(document).on("click", ".broker-funcionalidades .switch input", function () {
//   console.log("clicked");
//   if ($(this).val() == "0") {
//     $(this).val("1");
//   } else {
//     $(this).val("0");
//   }
// });
