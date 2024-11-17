function initMap() {

    // google.maps.Map
    //  - 서울역 좌료를 중심으로 하여 지도를 초기화
    //  - zoom 레벨은 13
    const map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: 37.5546788, lng: 126.9706069},
        zoom: 13,
        mapTypeControl: false,
    });

    const card = document.getElementById("pac-card");
    const input = document.getElementById("pac-input");
    const biasInputElement = document.getElementById("use-location-bias");
    const strictBoundsInputElement = document.getElementById("use-strict-bounds");

    // 자동완성 검색 field 옵션
    const options = {
        fields: ["formatted_address", "geometry", "name"],
        strictBounds: false,
    };

    // google.maps.Controls
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(card);

    // google.maps.Autocomplete
    //  - input 값을 기반으로 구글 지도 API 에서 제공하는 자동완성 기능 사용
    const autocomplete = new google.maps.places.Autocomplete(input, options);

    autocomplete.bindTo("bounds", map);

    // google.maps.InfoWindow
    // - 정보창 기능
    const infowindow = new google.maps.InfoWindow();
    const infowindowContent = document.getElementById("infowindow-content");

    infowindow.setContent(infowindowContent);

    // google.maps.Marker
    // - 마커 기능
    const marker = new google.maps.Marker({
        map,
        anchorPoint: new google.maps.Point(0, -29),
    });

    // 자동완성 함수
    autocomplete.addListener("place_changed", () => {
        infowindow.close(); // 열려있는 정보창 닫기
        marker.setVisible(false);  // 열려있는 마커 숨김

        const place = autocomplete.getPlace();  // 자동완성 검색 실시

        // 적절한 정소가 없거나 값을 입력안하거나 자동완성목록에서 선택하지 않으면 경고창
        if (!place.geometry || !place.geometry.location) {
            window.alert("No details available for input: '" + place.name + "'");
            return;
        }

        // viewport 가 존재한다면 해당 값을 지도의 경계값으로 설정
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else { // 존재하지 않으면 검색 장소의 위/경도 값을 지도의 중앙 값으로 설정
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }

        // 마커를 세팅하고
        marker.setPosition(place.geometry.location);
        // 지도에 보이게 설정
        marker.setVisible(true);

        // 정보창에 장소이름과 주소 설정 ?!
        infowindowContent.children["place-name"].textContent = place.name;
        infowindowContent.children["place-address"].textContent = place.formatted_address;

        infowindow.open(map, marker);
    });

    function setupClickListener(id, types) {
        const radioButton = document.getElementById(id);

        radioButton.addEventListener("click", () => {
            autocomplete.setTypes(types);
            input.value = "";
        });
    }

    // 장소 검색 옵션
    setupClickListener("changetype-all", []);
    setupClickListener("changetype-address", ["address"]);
    setupClickListener("changetype-establishment", ["establishment"]);
    setupClickListener("changetype-geocode", ["geocode"]);
    setupClickListener("changetype-cities", ["(cities)"]);
    setupClickListener("changetype-regions", ["(regions)"]);

    // 검색 결과를 현재 지도 뷰포트 내에서 우선적으로 표시
    biasInputElement.addEventListener("change", () => {
        if (biasInputElement.checked) {
            autocomplete.bindTo("bounds", map);
        } else {
            autocomplete.unbind("bounds");
            autocomplete.setBounds({ east: 180, west: -180, north: 90, south: -90 });
            strictBoundsInputElement.checked = biasInputElement.checked;
        }
        input.value = "";
    });

    // 검색 결과를 지도 뷰포트 경계 내부로만 제한(경계 밖의 결과는 표시되지 않음)
    strictBoundsInputElement.addEventListener("change", () => {
        autocomplete.setOptions({
            strictBounds: strictBoundsInputElement.checked,
        });
        if (strictBoundsInputElement.checked) {
            biasInputElement.checked = strictBoundsInputElement.checked;
            autocomplete.bindTo("bounds", map);
        }
        input.value = "";
    });
}

window.initMap = initMap;