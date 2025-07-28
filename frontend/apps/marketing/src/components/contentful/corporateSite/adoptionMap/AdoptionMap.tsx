'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Map, {
  FullscreenControl,
  Layer,
  MapMouseEvent,
  MapRef,
  NavigationControl,
  Popup,
  Source,
} from 'react-map-gl/mapbox';

import {Heading3} from '@code-dot-org/component-library/typography';

import {getMapboxAccessToken} from '@/config/mapbox';

import AdoptionMapInfo from './AdoptionMapInfo';
import AdoptionMapPoint, {
  MAP_POINT_NO_DATA_COLOR,
  MAP_POINT_HAS_CS_COLOR,
  MAP_POINT_NO_CS_COLOR,
  MAP_POINT_STROKE_COLOR,
  MAP_POINT_STROKE_WIDTH,
  MAP_POINT_TYPES,
} from './AdoptionMapPoint';
import type {School} from './types';
import './adoptionMap.scss';

import styles from './adoptionMap.module.scss';

const MAP_TILESET_ID = 'censustiles';
const MAP_POINT_LAYER_ID = 'census';
const MAPBOX_STYLE_URL = 'mapbox://styles/codeorg/cjyudafoo004w1cnpaeq8a0lz';
const NO_CS_SCHOOLS_LAYER_ID = 'census-schools';
const CS_SCHOOLS_LAYER_ID = 'census-schools-teaching-cs';

const DEFAULT_LNG = -98;
const DEFAULT_LAT = 39;
const DEFAULT_ZOOM = 3;
const MAP_POINT_ZOOM = 14;

interface AdoptionMapMapProps {
  school?: School | null;
  onTakeSurveyClick?: (school: School) => void;
}

const AdoptionMap: React.FC<AdoptionMapMapProps> = ({
  school,
  onTakeSurveyClick,
}) => {
  const mapRef = useRef<MapRef>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [popupData, setPopupData] = useState<{
    longitude: number;
    latitude: number;
    school: School;
  } | null>(null);

  const mapInstance = useMemo(
    () => (mapLoaded ? mapRef?.current?.getMap() : null),
    [mapLoaded, mapRef?.current],
  );

  const moveToLocation = useCallback(
    (lng: number, lat: number, zoom: number = MAP_POINT_ZOOM) => {
      mapInstance?.flyTo({
        zoom,
        center: {lng, lat},
        speed: 2,
        essential: true,
      });
    },
    [mapInstance],
  );

  const showSchoolPopup = useCallback(
    (school: School | null | undefined) => {
      setPopupData(null);

      if (!mapInstance) return;
      if (!school || !school.latitude || !school.longitude) return;

      const schoolLng = Number(school.longitude);
      const schoolLat = Number(school.latitude);

      moveToLocation(
        schoolLng,
        schoolLat,
        Math.max(mapInstance.getZoom(), MAP_POINT_ZOOM),
      );

      mapInstance.once('moveend', () => {
        let newPopupData;

        const schoolPoint = mapInstance.querySourceFeatures(MAP_TILESET_ID, {
          sourceLayer: MAP_POINT_LAYER_ID,
          filter: ['all', ['==', 'school_id', school.nces_id]],
        })[0];

        if (schoolPoint?.geometry?.type === 'Point') {
          const schoolProps = schoolPoint?.properties;
          const [schoolPointLng, schoolPointLat] =
            schoolPoint.geometry.coordinates;

          newPopupData = {
            longitude: schoolPointLng,
            latitude: schoolPointLat,
            school: {
              ...school,
              teachesCs: schoolProps?.teaches_cs || undefined,
            },
          };
        } else {
          newPopupData = {
            longitude: schoolLng,
            latitude: schoolLat,
            school,
          };
        }

        setPopupData(newPopupData);
      });
    },
    [mapInstance, moveToLocation],
  );

  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      if (!mapInstance) return;

      setPopupData(null);

      const schoolFeature = event.features?.find(
        f =>
          f.layer &&
          [NO_CS_SCHOOLS_LAYER_ID, CS_SCHOOLS_LAYER_ID].includes(f.layer.id),
      );

      if (schoolFeature?.geometry?.type === 'Point') {
        const properties = schoolFeature.properties;

        const coordinates = schoolFeature.geometry.coordinates.slice();
        // Adjust longitude for world wrapping
        while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += event.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        const [pointLng, pointLat] = coordinates;

        moveToLocation(pointLng, pointLat, mapInstance.getZoom());

        setPopupData(
          properties
            ? {
                longitude: pointLng,
                latitude: pointLat,
                school: {
                  nces_id: properties.school_id,
                  name: properties.school_name,
                  city: properties.school_city,
                  state: properties.school_state,
                  longitude: String(pointLng),
                  latitude: String(pointLat),
                  teachesCs: properties.teaches_cs || undefined,
                },
              }
            : null,
        );
      }
    },
    [mapInstance, moveToLocation],
  );

  useEffect(() => {
    if (!mapInstance) return;

    window.addEventListener('resize', () => {
      mapInstance.resize();
    });

    mapInstance.resize();
  }, [mapInstance]);

  useEffect(() => {
    if (mapInstance) showSchoolPopup(school);
  }, [mapInstance, showSchoolPopup, school]);

  return (
    <section aria-label="Adoption Map" className={styles.adoptionMap}>
      <Map
        id="adoption-map"
        ref={mapRef}
        mapboxAccessToken={getMapboxAccessToken()}
        mapStyle={MAPBOX_STYLE_URL}
        initialViewState={{
          longitude: DEFAULT_LNG,
          latitude: DEFAULT_LAT,
          zoom: DEFAULT_ZOOM,
        }}
        minZoom={1}
        dragRotate={false}
        interactiveLayerIds={[NO_CS_SCHOOLS_LAYER_ID, CS_SCHOOLS_LAYER_ID]}
        onClick={handleMapClick}
        onLoad={() => setMapLoaded(true)}
        onMouseEnter={event => {
          event.target.getCanvas().style.cursor = 'pointer';
        }}
        onMouseLeave={event => {
          event.target.getCanvas().style.cursor = '';
        }}
      >
        <FullscreenControl position="top-right" />
        <NavigationControl position="bottom-right" showCompass={false} />

        <Source
          id={MAP_TILESET_ID}
          type="vector"
          url={`mapbox://codeorg.${MAP_TILESET_ID}`}
        >
          <Layer
            id={NO_CS_SCHOOLS_LAYER_ID}
            source={MAP_TILESET_ID}
            source-layer={MAP_POINT_LAYER_ID}
            layout={{visibility: 'visible'}}
            type="circle"
            paint={{
              'circle-radius': 4,
              'circle-color': [
                'match',
                ['get', 'teaches_cs'],
                ['NO', 'N', 'HISTORICAL_NO', 'HN'],
                MAP_POINT_NO_CS_COLOR,
                MAP_POINT_NO_DATA_COLOR,
              ],
              'circle-stroke-width': MAP_POINT_STROKE_WIDTH,
              'circle-stroke-color': MAP_POINT_STROKE_COLOR,
            }}
            filter={[
              'all',
              ['!=', 'teaches_cs', 'YES'],
              ['!=', 'teaches_cs', 'Y'],
              ['!=', 'teaches_cs', 'HISTORICAL_YES'],
              ['!=', 'teaches_cs', 'HY'],
              ['!=', 'teaches_cs', 'EXCLUDED'],
            ]}
          />
          <Layer
            id={CS_SCHOOLS_LAYER_ID}
            source={MAP_TILESET_ID}
            source-layer={MAP_POINT_LAYER_ID}
            layout={{visibility: 'visible'}}
            type="circle"
            paint={{
              'circle-radius': 4,
              'circle-color': [
                'match',
                ['get', 'teaches_cs'],
                ['YES', 'Y', 'HISTORICAL_YES', 'HY'],
                MAP_POINT_HAS_CS_COLOR,
                MAP_POINT_NO_DATA_COLOR,
              ],
              'circle-stroke-width': MAP_POINT_STROKE_WIDTH,
              'circle-stroke-color': MAP_POINT_STROKE_COLOR,
            }}
            filter={[
              'any',
              ['==', 'teaches_cs', 'YES'],
              ['==', 'teaches_cs', 'Y'],
              ['==', 'teaches_cs', 'HISTORICAL_YES'],
              ['==', 'teaches_cs', 'HY'],
            ]}
          />
        </Source>

        {popupData && (
          <Popup
            longitude={popupData.longitude}
            latitude={popupData.latitude}
            onClose={() => setPopupData(null)}
            closeButton={true}
            closeOnClick={false}
            anchor="bottom"
          >
            <AdoptionMapInfo
              school={popupData.school}
              onTakeSurveyClick={onTakeSurveyClick}
            />
          </Popup>
        )}
      </Map>

      <aside
        aria-label="Adoption Map Legend"
        className={styles.adoptionMapLegend}
      >
        <Heading3 visualAppearance="heading-xs">Legend</Heading3>

        <ul>
          <li>
            <AdoptionMapPoint type={MAP_POINT_TYPES.HAS_CS} />
            <small>Offers computer science</small>
          </li>
          <li>
            <AdoptionMapPoint type={MAP_POINT_TYPES.NO_CS} />
            <small>No CS opportunities</small>
          </li>
          <li>
            <AdoptionMapPoint type={MAP_POINT_TYPES.NO_DATA} />
            <small>No Data</small>
          </li>
        </ul>
      </aside>
    </section>
  );
};

export default AdoptionMap;
